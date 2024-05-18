import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

import { buyElement } from './elementerra-program/instructions';

import { getElementumTokenAddress, getPlayerPDA } from './buildLevelUpIx';
import {
    BUBBLEGUM_PROGRAM,
    BUBBLEGUM_SIGNER,
    COLLECTION_MASTER_EDITION,
    COLLECTION_METADATA,
    COLLECTION_MINT,
    ELEMENTUM_MINT,
    ELEMENT_MERKLE_TREE,
    EL_PROGRAM_SIGNER,
    EL_SOL_RECEIVER,
    LOG_WRAPPER_ACCOUNT,
    METAPLEX_TOKEN_METADATA_PROGRAM,
    RENT_PROGRAM,
    SEASON,
    STATE_COMPRESSION_PROGRAM,
    SYSTEM_PROGRAM,
    TREE_AUTHORITY,
} from './constants';
import { ElementName, ElementNameJSON, ElementNameKind } from './elementerra-program/types';

export function getElementNameKindByName(name: string): ElementNameKind {
    return ElementName.fromJSON({
        kind: name,
    } as ElementNameJSON);
}

export function buildBuyElementIx(payer: PublicKey, elementName: string, elementId: PublicKey): TransactionInstruction {
    const element = getElementNameKindByName(elementName);

    const eleTokenAccount = getElementumTokenAddress(payer);

    return buyElement(
        { element },
        {
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SYSTEM_PROGRAM,
            rent: RENT_PROGRAM,
            authority: payer,
            programSigner: EL_PROGRAM_SIGNER,
            solReceiver: EL_SOL_RECEIVER,
            season: SEASON,
            player: getPlayerPDA(payer),
            element: elementId,
            elementumMint: ELEMENTUM_MINT,
            userTokenAccount: eleTokenAccount,
            treeAuthority: TREE_AUTHORITY,
            bubblegumSigner: BUBBLEGUM_SIGNER,
            merkleTree: ELEMENT_MERKLE_TREE,
            leafOwner: payer,
            leafDelegate: payer,
            collectionMint: COLLECTION_MINT,
            collectionMetadata: COLLECTION_METADATA,
            collectionMasterEdition: COLLECTION_MASTER_EDITION,
            metaplexTokenMetadataProgram: METAPLEX_TOKEN_METADATA_PROGRAM,
            bubblegumProgram: BUBBLEGUM_PROGRAM,
            compressionProgram: STATE_COMPRESSION_PROGRAM,
            logWrapper: LOG_WRAPPER_ACCOUNT,
        }
    );
}
