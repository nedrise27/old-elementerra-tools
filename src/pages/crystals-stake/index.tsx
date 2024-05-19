import { Box, Button, Container } from '@mui/material';
import { ConcurrentMerkleTreeAccount } from '@solana/spl-account-compression';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ComputeBudgetProgram, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { DAS, RpcClient } from 'helius-sdk';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { buildClaimCrystalInstruction } from '../../lib/buildClaimCrystalIx';
import { buildStakeCrystalIx } from '../../lib/buildStakeCrystalIx';
import { buildUnstakeCrystalIx } from '../../lib/buildUnstakeCrystalIx';
import { CRYSTAL_MERKLE_TREE } from '../../lib/constants';
import { NftStakeProof } from '../../lib/elementerra-program/accounts';
import { asyncSleep } from '../../lib/utils';
import { fetchNftStakeProofs } from '../../lib/utils/stake';
import { ELEMENTERRA_CRYSTALS_COLLECTION, ELEMENTERRA_CRYSTALS_COLLECTION2 } from '../_app';
import { COMPUTE_UNIT_LIMIT, TRANSACTION_FEE, levelUpWhitelist } from '../leveling';

type CrystalWithStakeProof = {
    crystal: DAS.GetAssetResponse;
    stakeProof: NftStakeProof;
    stakeProofAddress: PublicKey;
};

const CRYSTALS_TO_CLAIM_INSTRUCTIONS_CHUNK = 5;

export default function ClaimPage() {
    const { connection } = useConnection();
    const helius = new RpcClient(connection, 'elementerra-tools');
    const { publicKey, signAllTransactions, sendTransaction, connecting, connected, disconnecting } = useWallet();

    const [stakedCrystals, setStakedCrystals] = useState<CrystalWithStakeProof[]>([]);
    const [unstakedCrystals, setUnstakedCrystals] = useState<DAS.GetAssetResponse[]>([]);

    const [crystalTreeAccount, setCrystalTreeAccount] = useState<ConcurrentMerkleTreeAccount>();

    const [status, setStatus] = useState<string>('');

    async function fetchStakedCrystals() {
        if (!publicKey || _.isEmpty(publicKey)) {
            setStatus('Did not find wallet, please refresh');
            return;
        }

        setStakedCrystals([]);
        setStatus('Fetching staked crystals ...');
        const stakeProofs = await fetchNftStakeProofs(connection, publicKey.toString());

        const nftMints = stakeProofs.map(([r]) => r.nftMint.toString());
        const nfts = (
            await helius.getAssetBatch({
                displayOptions: {
                    showCollectionMetadata: true,
                    showUnverifiedCollections: false,
                },
                ids: nftMints,
            })
        ).filter((n) => !n.burnt);

        const crystalsWithStakeProofs = [];

        for (const crystal of nfts) {
            const [stakeProof, stakeProofAddress] = stakeProofs.find(([s]) => s.nftMint.toString() === crystal.id)!;

            crystalsWithStakeProofs.push({
                crystal,
                stakeProof,
                stakeProofAddress,
            });
        }

        setStatus('');
        setStakedCrystals(crystalsWithStakeProofs);
    }

    async function fetchUnstakedCrystals() {
        if (!publicKey || _.isEmpty(publicKey)) {
            setStatus('Did not find wallet, please refresh');
            return;
        }

        setUnstakedCrystals([]);
        setStatus('Fetching unstaked crystals ...');

        let _walletCrystals: DAS.GetAssetResponse[] = [];

        const limit = 1000;
        let page = 1;

        while (true) {
            const res = await helius.searchAssets({
                ownerAddress: publicKey.toString(),
                grouping: ['collection', ELEMENTERRA_CRYSTALS_COLLECTION],
                burnt: false,
                page,
                limit,
            });

            _walletCrystals = [..._walletCrystals, ...res.items];

            if (res.items.length < limit) {
                break;
            }

            page++;
        }

        while (true) {
            const res = await helius.searchAssets({
                ownerAddress: publicKey.toString(),
                grouping: ['collection', ELEMENTERRA_CRYSTALS_COLLECTION2],
                burnt: false,
                page,
                limit,
            });

            _walletCrystals = [..._walletCrystals, ...res.items];

            if (res.items.length < limit) {
                break;
            }

            page++;
        }

        setStatus('');
        setUnstakedCrystals(_walletCrystals);
    }

    async function fetchCrystalTreeAccount() {
        const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(connection, CRYSTAL_MERKLE_TREE);
        setCrystalTreeAccount(treeAccount);
    }

    async function refreshAll() {
        await fetchStakedCrystals();
        await fetchUnstakedCrystals();
        await fetchCrystalTreeAccount();
    }

    async function resetAll() {
        setStakedCrystals([]);
        setStatus('');
    }

    useEffect(() => {
        refreshAll();
    }, []);

    useEffect(() => {
        if (publicKey) {
            if (levelUpWhitelist.includes(publicKey.toString())) {
                refreshAll();
            }
        } else {
            resetAll();
        }
    }, [publicKey, connected, connecting, disconnecting]);

    async function claimCrystals(amount: number) {
        if (!signAllTransactions) {
            setStatus('Wallet does not provide required feature');
            return;
        }
        const now = _.toInteger(new Date().getTime() / 1000);

        const crystalsToClaim = _.cloneDeep(stakedCrystals).filter(
            ({ stakeProof }) => now - stakeProof.lastClaimed.toNumber() > 60 * 60
        );

        const txs: VersionedTransaction[] = [];

        let count = 0;
        for (const chunk of _.chunk(crystalsToClaim, CRYSTALS_TO_CLAIM_INSTRUCTIONS_CHUNK)) {
            const tx = await buildClaimMultipleCrystalsTransaction(chunk);
            txs.push(tx);

            if (count >= amount) {
                break;
            }
            count++;
        }

        const signedTxs = await signAllTransactions(txs);
        const signatures = [];
        for (const signedTx of signedTxs) {
            const signature = await connection.sendTransaction(signedTx, { skipPreflight: true });
            signatures.push(signature);
        }

        const {
            value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        setStatus('Confirming all transactions ...');
        await Promise.all(
            signatures.map((signature) => connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }))
        );

        await asyncSleep(4000);
        await refreshAll();
        setStatus('');
    }

    async function buildClaimMultipleCrystalsTransaction(crystalsWithStakeProofs: CrystalWithStakeProof[]) {
        setStatus('Building transactions');

        const ixs = [
            ComputeBudgetProgram.setComputeUnitLimit({
                units: COMPUTE_UNIT_LIMIT,
            }),
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: TRANSACTION_FEE,
            }),
        ];

        for (const { crystal, stakeProofAddress } of crystalsWithStakeProofs) {
            if (crystal.compression) {
                const { data_hash, leaf_id } = crystal.compression;
                const ix = buildClaimCrystalInstruction(
                    publicKey!,
                    crystal,
                    stakeProofAddress,
                    new PublicKey(data_hash),
                    leaf_id
                );
                ixs.push(ix);
            }
        }

        const {
            value: { blockhash },
        } = await connection.getLatestBlockhashAndContext();

        const messageV0 = new TransactionMessage({
            payerKey: publicKey!,
            recentBlockhash: blockhash,
            instructions: ixs,
        }).compileToV0Message();

        return new VersionedTransaction(messageV0);
    }

    async function unstakeCrystals(amount: number) {
        if (!signAllTransactions) {
            setStatus('Wallet does not provide required feature');
            return;
        }

        setStatus('Building transactions ...');

        const txs: VersionedTransaction[] = [];

        let count = 0;
        for (const { crystal } of stakedCrystals) {
            const ixs = [
                ComputeBudgetProgram.setComputeUnitLimit({
                    units: COMPUTE_UNIT_LIMIT,
                }),
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: TRANSACTION_FEE,
                }),
            ];
            const assetProof = await helius.getAssetProof({ id: crystal.id });

            const ix = buildUnstakeCrystalIx(publicKey!, crystal, assetProof, crystalTreeAccount!);
            ixs.push(ix);

            const {
                value: { blockhash },
            } = await connection.getLatestBlockhashAndContext();

            const messageV0 = new TransactionMessage({
                payerKey: publicKey!,
                recentBlockhash: blockhash,
                instructions: ixs,
            }).compileToV0Message();

            txs.push(new VersionedTransaction(messageV0));

            if (count > amount) {
                break;
            }
            count++;
        }

        setStatus('Waiting for wallet confirmation ...');
        const signedTxs = await signAllTransactions(txs);
        const signatures = [];
        for (const signedTx of signedTxs) {
            const signature = await connection.sendTransaction(signedTx, { skipPreflight: true });
            signatures.push(signature);
        }

        const {
            value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        setStatus('Confirming all transactions ...');
        await Promise.all(
            signatures.map((signature) => connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }))
        );

        await asyncSleep(4000);
        await refreshAll();
        setStatus('');
    }

    async function stakeCrystals(amount: number) {
        if (!signAllTransactions) {
            setStatus('Wallet does not provide required feature');
            return;
        }

        setStatus('Building transactions ...');

        const txs: VersionedTransaction[] = [];

        let count = 0;
        for (const crystal of unstakedCrystals) {
            const ixs = [
                ComputeBudgetProgram.setComputeUnitLimit({
                    units: COMPUTE_UNIT_LIMIT,
                }),
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: TRANSACTION_FEE,
                }),
            ];
            const assetProof = await helius.getAssetProof({ id: crystal.id });

            const ix = buildStakeCrystalIx(publicKey!, crystal, assetProof, crystalTreeAccount!);
            ixs.push(ix);

            const {
                value: { blockhash },
            } = await connection.getLatestBlockhashAndContext();

            const messageV0 = new TransactionMessage({
                payerKey: publicKey!,
                recentBlockhash: blockhash,
                instructions: ixs,
            }).compileToV0Message();

            txs.push(new VersionedTransaction(messageV0));

            if (count > amount) {
                break;
            }
            count++;
        }

        setStatus('Waiting for wallet confirmation ...');
        const signedTxs = await signAllTransactions(txs);
        const signatures = [];
        for (const signedTx of signedTxs) {
            const signature = await connection.sendTransaction(signedTx, { skipPreflight: true });
            signatures.push(signature);
        }

        const {
            value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        setStatus('Confirming all transactions ...');
        await Promise.all(
            signatures.map((signature) => connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }))
        );

        await asyncSleep(4000);
        await refreshAll();
        setStatus('');
    }

    return (
        <Container maxWidth="lg">
            <h1>Crystals: claim, stake and unstake</h1>
            <Box sx={{ display: 'flex', gap: '4rem', marginBottom: '2rem' }}>
                <p>Staked Crystals: {stakedCrystals.length}</p>
                <p>Unstaked Crystals: {unstakedCrystals.length}</p>
                <Button variant="outlined" onClick={refreshAll}>
                    refresh
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: '.5rem', flexWrap: 1 }}>
                {/* <Button
                    variant="contained"
                    disabled={_.isEmpty(stakedCrystals)}
                    onClick={async () => claimCrystals(50)}
                >
                    Claim 50
                </Button>
                <Button
                    variant="contained"
                    disabled={_.isEmpty(stakedCrystals)}
                    onClick={async () => claimCrystals(100)}
                >
                    Claim 100
                </Button> */}

                <Button
                    variant="contained"
                    disabled={_.isEmpty(unstakedCrystals) || !_.isEmpty(status)}
                    onClick={async () => stakeCrystals(50)}
                >
                    Stake 50
                </Button>
                <Button
                    variant="contained"
                    disabled={_.isEmpty(unstakedCrystals) || !_.isEmpty(status)}
                    onClick={async () => stakeCrystals(100)}
                >
                    Stake 100
                </Button>

                <Button
                    variant="contained"
                    disabled={_.isEmpty(stakedCrystals) || !_.isEmpty(status)}
                    onClick={async () => unstakeCrystals(50)}
                >
                    Unstake 50
                </Button>
                <Button
                    variant="contained"
                    disabled={_.isEmpty(stakedCrystals) || !_.isEmpty(status)}
                    onClick={async () => unstakeCrystals(100)}
                >
                    Unstake 100
                </Button>
            </Box>

            <p>{status}</p>
        </Container>
    );
}
