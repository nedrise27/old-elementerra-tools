import { PublicKey } from '@metaplex-foundation/js';
import { findMetadataPda, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey as toPublicKey } from '@metaplex-foundation/umi-public-keys';
import { Button, Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ConcurrentMerkleTreeAccount } from '@solana/spl-account-compression';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ComputeBudgetProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { DAS, RpcClient } from 'helius-sdk';
import { useEffect, useState } from 'react';

import { Element, useElementsInfoStore } from '../../app/stores/shopElements';
import { buildLevelUpIx, getElementumTokenAddress } from '../../lib/buildLevelUpIx';
import { RAW_RABBIT_LEVEL_INFO } from '../../lib/constants';
import { NftLevelAttributes } from '../../lib/elementerra-program/accounts';
import { asyncSleep } from '../../lib/utils';
import {
    ELEMENTERRA_CREATORS,
    ELEMENTERRA_ELEMENTS_COLLECTION,
    ELEMENTERRA_INVENTOR_COLLECTION,
    ELEMENTERRA_PROGRAM_ID,
    ELEMENTERRA_RABBITS_COLLECTION,
} from '../_app';
import { useConfigStore } from '../../app/stores/config';

export const COMPUTE_UNIT_LIMIT = 1000000;

type RabbitWithLevel = {
    rabbit: DAS.GetAssetResponse;
    isInventor: boolean;
    level: NftLevelAttributes;
    levelAttributesAddress: PublicKey;
};

type LevelingError = null | 'no-ele' | 'no-element' | 'wallet-not-connected' | 'rabbit-not-selected';

export const levelUpWhitelist = process.env.NEXT_PUBLIC_LEVEL_UP_WHITELIST?.split(',') || [];

export default function LevelingPage() {
    const { connection } = useConnection();
    const helius = new RpcClient(connection, 'elementerra-tools');
    const umi = createUmi(connection).use(mplTokenMetadata());

    const { publicKey, sendTransaction, connecting, connected, disconnecting } = useWallet();

    const elements = useElementsInfoStore((state) => state.elements);
    const refetchElements = useElementsInfoStore((state) => state.fetch);
    const txFees = useConfigStore((state) => state.txFees);

    const [rabbitsWithLevel, setRabbitsWithLevel] = useState<RabbitWithLevel[]>([]);

    const [selectedRabbitId, setSelectedRabbitId] = useState<string>();
    const [selectedLevel, setSelectedLevel] = useState<NftLevelAttributes>();

    const [elementsInWallet, setElementsInWallet] = useState<DAS.GetAssetResponse[]>([]);
    const [eleInWallet, setEleInWallet] = useState<number>(0);

    const [error, setError] = useState<LevelingError>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const [status, setStatus] = useState('');

    const [locked, setLocked] = useState(true);

    async function fetchRabbits() {
        if (!publicKey) return;

        const _rabbitsWithLevel = [];

        const limit = 1000;
        let page = 1;

        let done = false;
        while (!done) {
            const res = await helius.searchAssets({
                ownerAddress: publicKey?.toString(),
                creatorAddress: ELEMENTERRA_CREATORS[1],
                grouping: ['collection', ELEMENTERRA_RABBITS_COLLECTION],
                burnt: false,
                page,
                limit,
            });

            for (const rabbit of res.items) {
                const address = rabbit.id;

                const [levelAttributes, levelPda] = await fetchLevel(address);

                _rabbitsWithLevel.push({
                    rabbit,
                    level: levelAttributes!,
                    levelAttributesAddress: levelPda,
                    isInventor: false,
                });
            }

            page++;
            done = res.items.length < limit;
        }

        const inventorRes = await helius.searchAssets({
            ownerAddress: publicKey?.toString(),
            creatorAddress: ELEMENTERRA_CREATORS[1],
            grouping: ['collection', ELEMENTERRA_INVENTOR_COLLECTION],
            burnt: false,
            page: 1,
            limit: 100,
        });

        for (const rabbit of inventorRes.items) {
            const address = rabbit.id;

            const [levelAttributes, levelPda] = await fetchLevel(address);

            _rabbitsWithLevel.push({
                rabbit,
                level: levelAttributes!,
                levelAttributesAddress: levelPda,
                isInventor: true,
            });
        }

        setRabbitsWithLevel(_rabbitsWithLevel);
    }

    async function fetchLevel(address: string): Promise<[NftLevelAttributes, PublicKey]> {
        const [levelPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(`nft_level_`), new PublicKey(address!).toBytes()],
            new PublicKey(ELEMENTERRA_PROGRAM_ID)
        );
        const levelAttributes = await NftLevelAttributes.fetch(connection, levelPda);

        return [levelAttributes!, levelPda!];
    }

    async function fetchElementsInWallet() {
        if (!publicKey) return;

        let _walletElements: DAS.GetAssetResponse[] = [];

        const limit = 1000;
        let page = 1;

        let done = false;
        while (!done) {
            const res = await helius.searchAssets({
                ownerAddress: publicKey!.toString(),
                creatorAddress: ELEMENTERRA_CREATORS[1],
                grouping: ['collection', ELEMENTERRA_ELEMENTS_COLLECTION],
                burnt: false,
                page,
                limit,
            });

            _walletElements = [..._walletElements, ...res.items];

            page++;
            done = res.items.length < limit;
        }

        setElementsInWallet(_walletElements);
    }

    async function fetchEleBalance() {
        const ata = getElementumTokenAddress(publicKey!);
        const info = await connection.getTokenAccountBalance(ata);
        setEleInWallet(info?.value?.uiAmount || 0);
    }

    async function refreshAll() {
        resetErrors();
        await refetchElements(connection);
        if (publicKey) {
            await fetchRabbits();
            await fetchElementsInWallet();
            await fetchEleBalance();
        }
    }

    function resetErrors() {
        setError(null);
        setErrorMsg('');
    }

    useEffect(() => {
        refreshAll();
    }, [publicKey, connection]);

    useEffect(() => {
        setLocked(true);
        if (publicKey) {
            if (levelUpWhitelist.includes(publicKey.toString())) {
                setLocked(false);
            }
        }
    }, [publicKey, connected, connecting, disconnecting]);

    useEffect(() => {
        if (!connected || disconnecting) {
            setSelectedRabbitId(undefined);
            setSelectedLevel(undefined);
            setEleInWallet(0);
            setElementsInWallet([]);
            setRabbitsWithLevel([]);
        }
        if (connected) {
            refreshAll();
        }
    }, [connected, disconnecting, connection]);

    function selectRabbit(id: string) {
        resetErrors();
        const { level, levelAttributesAddress } = rabbitsWithLevel.find(({ rabbit }) => rabbit.id === id)!;
        setSelectedRabbitId(id);
        setSelectedLevel(level);
    }

    function selectedRabbit(): DAS.GetAssetResponse | undefined {
        return rabbitsWithLevel.find(({ rabbit }) => rabbit.id === selectedRabbitId)?.rabbit;
    }

    async function fetchProof(id: string) {
        try {
            const res = helius.getAssetProof({ id });
            if (res) {
                return res;
            }
            throw new Error();
        } catch (err) {
            await asyncSleep(500);
            return fetchProof(id);
        }
    }

    async function fetchTreeAccount(treeId: string) {
        try {
            const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(connection, new PublicKey(treeId));
            if (treeAccount) {
                return treeAccount;
            }
            throw new Error();
        } catch (err) {
            await asyncSleep(500);
            return fetchTreeAccount(treeId);
        }
    }

    async function levelUp() {
        while (true) {
            setStatus('Refreshing wallet ...');
            await refreshAll();
            await fetchEleBalance();

            resetErrors();

            const lookupTableAccount = await connection.getAddressLookupTable(
                new PublicKey('95ipkNRZmy3EC8nhpJMistxpG9oBssjxt15TTocBMMnP')
            );

            if (!lookupTableAccount?.value) return;

            const [currentLevel, currentLevelAddress] = await fetchLevel(selectedRabbitId!);
            setSelectedLevel(currentLevel);

            if (!publicKey) {
                setError('wallet-not-connected');
                setErrorMsg('Wallet is not connected');
                return;
            }

            if (!currentLevel || !selectedRabbit() || !currentLevelAddress) {
                setError('rabbit-not-selected');
                setErrorMsg('Please select a rabbit to level');
                return;
            }

            if (currentLevel.level === 100) {
                setError(null);
                return;
            }

            setStatus(`Building transaction ...`);

            const [nextElementToBurn, eleToBurn] = getNextElementAndELEToBurn(currentLevel.level);

            if (eleInWallet < eleToBurn) {
                setError('no-ele');
                setErrorMsg(`Not enough ELE in wallet. ${eleToBurn} ELE needed. Balance: ${eleInWallet} ELE`);
                return;
            }

            const foundElementToBurn = elementsInWallet.find(
                (e) =>
                    e.content?.metadata.name.replace(' ', '').toLowerCase() ===
                    nextElementToBurn.name.replace(' ', '').toLowerCase()
            );

            if (!foundElementToBurn) {
                setError('no-element');
                setErrorMsg(`Element ${nextElementToBurn.name} is not in wallet.`);
                return;
            }

            const proof = await fetchProof(foundElementToBurn.id);

            const treeAccount = await fetchTreeAccount(proof.tree_id);

            const [metadataAddress] = findMetadataPda(umi, { mint: toPublicKey(selectedRabbit()!.id) });

            const ix = buildLevelUpIx(
                publicKey,
                selectedRabbit()!,
                metadataAddress,
                foundElementToBurn,
                proof,
                currentLevelAddress!,
                new PublicKey(nextElementToBurn.address),
                treeAccount
            );

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const messageV0 = new TransactionMessage({
                payerKey: publicKey!,
                recentBlockhash: blockhash,
                instructions: [
                    ComputeBudgetProgram.setComputeUnitLimit({
                        units: COMPUTE_UNIT_LIMIT,
                    }),
                    ComputeBudgetProgram.setComputeUnitPrice({
                        microLamports: txFees,
                    }),
                    ix,
                ],
            }).compileToV0Message([lookupTableAccount.value]);

            const tx = new VersionedTransaction(messageV0);

            try {
                setStatus('Waiting for wallet ...');
                const signature = await sendTransaction(tx, connection, { minContextSlot });
                await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
                setStatus('Next level in 4s ...');
                await asyncSleep(4000);
            } catch (err) {
                setStatus('Failed. Wait 4s ...');
                await asyncSleep(4000);
            }
        }
    }

    function getNextElementAndELEToBurn(level: number): [Element, number] {
        const levelInfo = RAW_RABBIT_LEVEL_INFO.find((e) => e.level === level + 1);
        const nextElement = elements.find((e) => e.name.toLowerCase() === levelInfo?.elementToBurn?.toLowerCase())!;
        console.log('Next element to burn', nextElement.name, 'ele to burn', levelInfo?.eleToBurn);
        return [nextElement, levelInfo?.eleToBurn!];
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ padding: '1rem', boxSizing: 'border-box' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <h1>Level up</h1>
                </Box>

                {locked ? (
                    <>
                        <h2>This feature is currently only available for community members</h2>
                        <p>If you want to use it, hit me up on our discord @nedrise</p>
                    </>
                ) : (
                    <>
                        <h2>Rabbits</h2>
                        <ul>
                            {rabbitsWithLevel.map(({ rabbit, level }) => (
                                <li key={rabbit.id}>
                                    <Button variant="outlined" onClick={() => selectRabbit(rabbit.id)}>
                                        {rabbit.content?.metadata.name} Lvl: {level.level}
                                    </Button>
                                </li>
                            ))}
                        </ul>

                        {selectedRabbit() && selectedLevel && (
                            <div>
                                <h2>
                                    Leveling {selectedRabbit()!.content?.metadata.name} next level{' '}
                                    {selectedLevel.level + 1}
                                </h2>

                                {error && (
                                    <div>
                                        <Typography color="#ff0000">{errorMsg}</Typography>
                                        <Button variant="contained" onClick={levelUp}>
                                            Retry
                                        </Button>
                                    </div>
                                )}

                                {selectedLevel.level === 100 ? (
                                    <p>Level 100 reached</p>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: '1rem' }}>
                                        <Button variant="contained" onClick={levelUp} disabled={!!error}>
                                            Level Up
                                        </Button>
                                    </Box>
                                )}
                            </div>
                        )}

                        <Box>
                            <h4>{status}</h4>
                        </Box>
                    </>
                )}
            </Container>
        </>
    );
}
