import * as borsh from '@coral-xyz/borsh';
import { ConcurrentMerkleTreeAccount } from '@solana/spl-account-compression';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AccountMeta, PublicKey, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import { DAS } from 'helius-sdk';
import { getElementumTokenAddress } from './buildLevelUpIx';
import {
    BUBBLEGUM_PROGRAM,
    BUBBLEGUM_SIGNER,
    CRYSTAL_MERKLE_TREE,
    CRYSTAL_STAKING_POOL,
    CRYSTAL_TREE_AUTHORITY,
    ELEMENTUM_MINT,
    EL_PROGRAM_SIGNER,
    LOG_WRAPPER_ACCOUNT,
    METAPLEX_TOKEN_METADATA_PROGRAM,
    RENT_PROGRAM,
    STATE_COMPRESSION_PROGRAM,
    SYSTEM_PROGRAM,
} from './constants';
import { PROGRAM_ID } from './elementerra-program/programId';
import * as types from './elementerra-program/types';

export function getCrystalTier(tier: number): types.CrystalTierKind {
    return types.CrystalTier.fromJSON({
        kind: `Tier${tier}`,
    } as types.CrystalTierJSON);
}

export function getEscrowCNFTPDA(nftId: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(`escrow_crystal`), new PublicKey(nftId).toBytes()],
        PROGRAM_ID
    );
    return pda;
}

export function getStakeProofPDA(nftMint: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('nft_staked_'), new PublicKey(nftMint).toBytes()],
        PROGRAM_ID
    );
    return pda;
}

export function buildUnstakeCrystalIx(
    payer: PublicKey,
    nft: DAS.GetAssetResponse,
    assetProof: DAS.GetAssetProofResponse,
    treeAccount: ConcurrentMerkleTreeAccount
) {
    const tier = nft.content?.metadata.attributes?.find((a) => a.trait_type === 'level')?.value;
    if (!tier) {
        console.log(nft);
        throw new Error('Could not get level');
    }

    const { creator_hash, data_hash, leaf_id } = nft.compression!;

    const canopyDepth = treeAccount.getCanopyDepth();
    const proofPath: AccountMeta[] = assetProof.proof
        .map((node: string) => ({
            pubkey: new PublicKey(node),
            isSigner: false,
            isWritable: false,
        }))
        .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0));

    return unstakeCnft(
        {
            crystalTier: getCrystalTier(parseInt(tier!, 10)),
            creatorHash: [...new PublicKey(creator_hash.trim()).toBytes()],
            dataHash: [...new PublicKey(data_hash.trim()).toBytes()],
            root: [...new PublicKey(assetProof.root.trim()).toBytes()],
            index: leaf_id,
            nonce: new BN(leaf_id),
        },
        {
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SYSTEM_PROGRAM,
            rent: RENT_PROGRAM,
            authority: payer,
            programSigner: EL_PROGRAM_SIGNER,
            escrowCnft: getEscrowCNFTPDA(nft.id),
            nftStakeProof: getStakeProofPDA(nft.id),
            crystalTreeAuthority: CRYSTAL_TREE_AUTHORITY,
            crystalMerkleTree: CRYSTAL_MERKLE_TREE,
            elementumMint: ELEMENTUM_MINT,
            stakingPool: CRYSTAL_STAKING_POOL,
            userTokenAccount: getElementumTokenAddress(payer),
            bubblegumSigner: BUBBLEGUM_SIGNER,
            metaplexTokenMetadataProgram: METAPLEX_TOKEN_METADATA_PROGRAM,
            bubblegumProgram: BUBBLEGUM_PROGRAM,
            compressionProgram: STATE_COMPRESSION_PROGRAM,
            logWrapper: LOG_WRAPPER_ACCOUNT,
        },
        proofPath
    );
}

export interface UnstakeCnftArgs {
    crystalTier: types.CrystalTierKind;
    root: Array<number>;
    dataHash: Array<number>;
    creatorHash: Array<number>;
    nonce: BN;
    index: number;
}

export interface UnstakeCnftAccounts {
    associatedTokenProgram: PublicKey;
    tokenProgram: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
    authority: PublicKey;
    programSigner: PublicKey;
    escrowCnft: PublicKey;
    nftStakeProof: PublicKey;
    crystalTreeAuthority: PublicKey;
    crystalMerkleTree: PublicKey;
    elementumMint: PublicKey;
    stakingPool: PublicKey;
    userTokenAccount: PublicKey;
    bubblegumSigner: PublicKey;
    metaplexTokenMetadataProgram: PublicKey;
    bubblegumProgram: PublicKey;
    compressionProgram: PublicKey;
    logWrapper: PublicKey;
}

export const layout = borsh.struct([
    types.CrystalTier.layout('crystalTier'),
    borsh.array(borsh.u8(), 32, 'root'),
    borsh.array(borsh.u8(), 32, 'dataHash'),
    borsh.array(borsh.u8(), 32, 'creatorHash'),
    borsh.u64('nonce'),
    borsh.u32('index'),
]);

export function unstakeCnft(
    args: UnstakeCnftArgs,
    accounts: UnstakeCnftAccounts,
    proofPath: AccountMeta[],
    programId: PublicKey = PROGRAM_ID
) {
    const keys: Array<AccountMeta> = [
        {
            pubkey: accounts.associatedTokenProgram,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.rent, isSigner: false, isWritable: false },
        { pubkey: accounts.authority, isSigner: true, isWritable: true },
        { pubkey: accounts.programSigner, isSigner: false, isWritable: true },
        { pubkey: accounts.escrowCnft, isSigner: false, isWritable: true },
        { pubkey: accounts.nftStakeProof, isSigner: false, isWritable: true },
        {
            pubkey: accounts.crystalTreeAuthority,
            isSigner: false,
            isWritable: true,
        },
        { pubkey: accounts.crystalMerkleTree, isSigner: false, isWritable: true },
        { pubkey: accounts.elementumMint, isSigner: false, isWritable: false },
        { pubkey: accounts.stakingPool, isSigner: false, isWritable: true },
        { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: accounts.bubblegumSigner, isSigner: false, isWritable: false },
        {
            pubkey: accounts.metaplexTokenMetadataProgram,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: accounts.bubblegumProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.compressionProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.logWrapper, isSigner: false, isWritable: false },
        ...proofPath,
    ];
    const identifier = Buffer.from([171, 194, 46, 211, 116, 227, 222, 35]);
    const buffer = Buffer.alloc(1000);
    const len = layout.encode(
        {
            crystalTier: args.crystalTier.toEncodable(),
            root: args.root,
            dataHash: args.dataHash,
            creatorHash: args.creatorHash,
            nonce: args.nonce,
            index: args.index,
        },
        buffer
    );
    const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
    const ix = new TransactionInstruction({ keys, programId, data });
    return ix;
}
