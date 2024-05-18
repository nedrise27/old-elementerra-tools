import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import { DAS } from 'helius-sdk';
import { getElementumTokenAddress } from './buildLevelUpIx';
import { getCrystalTier } from './buildUnstakeCrystalIx';
import {
    CRYSTAL_MERKLE_TREE,
    CRYSTAL_STAKING_POOL,
    ELEMENTUM_MINT,
    EL_PROGRAM_SIGNER,
    RENT_PROGRAM,
    SYSTEM_PROGRAM,
} from './constants';
import { claimCnft } from './elementerra-program/instructions';

export function buildClaimCrystalInstruction(
    pubkey: PublicKey,
    crystal: DAS.GetAssetResponse,
    stakeProofAddress: PublicKey,
    dataHash: PublicKey,
    leafId: number
): TransactionInstruction {
    const tier = crystal.content?.metadata.attributes?.find((a) => a.trait_type === 'level')?.value;

    return claimCnft(
        {
            crystalTier: getCrystalTier(parseInt(tier!, 10)),
            dataHash: [...dataHash.toBytes()],
            nonce: new BN(leafId),
        },
        {
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SYSTEM_PROGRAM,
            rent: RENT_PROGRAM,
            authority: pubkey,
            programSigner: EL_PROGRAM_SIGNER,
            nftStakeProof: stakeProofAddress,
            merkleTree: CRYSTAL_MERKLE_TREE,
            elementumMint: ELEMENTUM_MINT,
            stakingPool: CRYSTAL_STAKING_POOL,
            userTokenAccount: getElementumTokenAddress(pubkey),
        }
    );
}
