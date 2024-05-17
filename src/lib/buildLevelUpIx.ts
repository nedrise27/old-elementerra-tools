import * as borsh from '@coral-xyz/borsh'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { AccountMeta, PublicKey, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import { DAS } from 'helius-sdk';
import { PROGRAM_ID } from './elementerra-program/programId';

import { ConcurrentMerkleTreeAccount } from '@solana/spl-account-compression';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
    BUBBLEGUM_PROGRAM,
    BUBBLEGUM_SIGNER,
    ELEMENTUM_MINT,
    ELEMENT_MERKLE_TREE,
    EL_PROGRAM_SIGNER,
    LOG_WRAPPER_ACCOUNT,
    METAPLEX_METADATA_ACCOUNT,
    METAPLEX_TOKEN_METADATA_PROGRAM,
    PACK_COLLECTION_MASTER_EDITION,
    PACK_COLLECTION_METADATA,
    PACK_COLLECTION_MINT,
    PACK_MERKLE_TREE,
    PACK_TREE_AUTHORITY,
    RENT_PROGRAM,
    SEASON,
    SEASON_NUMBER,
    STATE_COMPRESSION_PROGRAM,
    SYSTEM_PROGRAM,
    TREE_AUTHORITY,
} from './constants';

export function getPlayerPDA(payer: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(`player_${SEASON_NUMBER}`), payer.toBytes()],
        PROGRAM_ID
    );
    return pda;
}

export function getElementumTokenAddress(owner: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(ELEMENTUM_MINT, owner, true);
}

export function getRabbitTokenAccount(mint: PublicKey, owner: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(mint, owner, true);
}

export function buildLevelUpIx(
    payer: PublicKey,
    rabbit: DAS.GetAssetResponse,
    rabbitMetadataAddress: string,
    element: DAS.GetAssetResponse,
    assetProof: DAS.GetAssetProofResponse,
    levelAttributes: PublicKey,
    elementId: PublicKey,
    treeAccount: ConcurrentMerkleTreeAccount
): TransactionInstruction {
    const { creator_hash, data_hash, leaf_id } = element.compression!;

    const rabbitAddress = new PublicKey(rabbit.id);

    const proof = assetProof.proof;

    const canopyDepth = treeAccount.getCanopyDepth();
    const proofPath: AccountMeta[] = proof
        .map((node: string) => ({
            pubkey: new PublicKey(node),
            isSigner: false,
            isWritable: false,
        }))
        .slice(0, proof.length - (!!canopyDepth ? canopyDepth : 0));

    return levelUp(
        {
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
            season: SEASON,
            metaplexMetadataAccount: new PublicKey(rabbitMetadataAddress),
            nftMint: rabbitAddress,
            nftToken: getRabbitTokenAccount(rabbitAddress, payer),
            element: elementId,
            player: getPlayerPDA(payer),
            levelAttributes: levelAttributes,
            elementumMint: ELEMENTUM_MINT,
            userTokenAccount: getElementumTokenAddress(payer),
            packTreeAuthority: PACK_TREE_AUTHORITY,
            packMerkleTree: PACK_MERKLE_TREE,
            packLeafOwner: payer,
            packLeafDelegate: payer,
            packCollectionMint: PACK_COLLECTION_MINT,
            packCollectionMetadata: PACK_COLLECTION_METADATA,
            packCollectionMasterEdition: PACK_COLLECTION_MASTER_EDITION,
            treeAuthority: TREE_AUTHORITY,
            merkleTree: ELEMENT_MERKLE_TREE,
            leafOwner: payer,
            leafDelegate: payer,
            bubblegumSigner: BUBBLEGUM_SIGNER,
            metaplexTokenMetadataProgram: METAPLEX_TOKEN_METADATA_PROGRAM,
            bubblegumProgram: BUBBLEGUM_PROGRAM,
            compressionProgram: STATE_COMPRESSION_PROGRAM,
            logWrapper: LOG_WRAPPER_ACCOUNT,
        },
        proofPath
    );
}

export interface LevelUpArgs {
    root: Array<number>;
    dataHash: Array<number>;
    creatorHash: Array<number>;
    nonce: BN;
    index: number;
}

export interface LevelUpAccounts {
    associatedTokenProgram: PublicKey;
    tokenProgram: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
    authority: PublicKey;
    programSigner: PublicKey;
    season: PublicKey;
    metaplexMetadataAccount: PublicKey;
    nftMint: PublicKey;
    nftToken: PublicKey;
    element: PublicKey;
    player: PublicKey;
    levelAttributes: PublicKey;
    elementumMint: PublicKey;
    userTokenAccount: PublicKey;
    packTreeAuthority: PublicKey;
    packMerkleTree: PublicKey;
    packLeafOwner: PublicKey;
    packLeafDelegate: PublicKey;
    packCollectionMint: PublicKey;
    packCollectionMetadata: PublicKey;
    packCollectionMasterEdition: PublicKey;
    treeAuthority: PublicKey;
    merkleTree: PublicKey;
    leafOwner: PublicKey;
    leafDelegate: PublicKey;
    bubblegumSigner: PublicKey;
    metaplexTokenMetadataProgram: PublicKey;
    bubblegumProgram: PublicKey;
    compressionProgram: PublicKey;
    logWrapper: PublicKey;
}

export const layout = borsh.struct([
    borsh.array(borsh.u8(), 32, 'root'),
    borsh.array(borsh.u8(), 32, 'dataHash'),
    borsh.array(borsh.u8(), 32, 'creatorHash'),
    borsh.u64('nonce'),
    borsh.u32('index'),
]);

export function levelUp(
    args: LevelUpArgs,
    accounts: LevelUpAccounts,
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
        { pubkey: accounts.programSigner, isSigner: false, isWritable: false },
        { pubkey: accounts.season, isSigner: false, isWritable: false },
        {
            pubkey: accounts.metaplexMetadataAccount,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: accounts.nftMint, isSigner: false, isWritable: false },
        { pubkey: accounts.nftToken, isSigner: false, isWritable: false },
        { pubkey: accounts.element, isSigner: false, isWritable: false },
        { pubkey: accounts.player, isSigner: false, isWritable: true },
        { pubkey: accounts.levelAttributes, isSigner: false, isWritable: true },
        { pubkey: accounts.elementumMint, isSigner: false, isWritable: true },
        { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: accounts.packTreeAuthority, isSigner: false, isWritable: true },
        { pubkey: accounts.packMerkleTree, isSigner: false, isWritable: true },
        { pubkey: accounts.packLeafOwner, isSigner: false, isWritable: false },
        { pubkey: accounts.packLeafDelegate, isSigner: false, isWritable: false },
        { pubkey: accounts.packCollectionMint, isSigner: false, isWritable: false },
        {
            pubkey: accounts.packCollectionMetadata,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: accounts.packCollectionMasterEdition,
            isSigner: false,
            isWritable: true,
        },
        { pubkey: accounts.treeAuthority, isSigner: false, isWritable: true },
        { pubkey: accounts.merkleTree, isSigner: false, isWritable: true },
        { pubkey: accounts.leafOwner, isSigner: false, isWritable: false },
        { pubkey: accounts.leafDelegate, isSigner: false, isWritable: false },
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
    const identifier = Buffer.from([128, 64, 197, 116, 226, 129, 119, 234]);
    const buffer = Buffer.alloc(1000);
    const len = layout.encode(
        {
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
