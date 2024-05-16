import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UnstakeNftAccounts {
  associatedTokenProgram: PublicKey
  tokenProgram: PublicKey
  systemProgram: PublicKey
  rent: PublicKey
  authority: PublicKey
  programSigner: PublicKey
  nftStakeProof: PublicKey
  metaplexMetadataAccount: PublicKey
  nftMint: PublicKey
  nftToken: PublicKey
  elementumMint: PublicKey
  stakingPool: PublicKey
  userTokenAccount: PublicKey
  nftEdition: PublicKey
  metaplexTokenMetadataProgram: PublicKey
}

export function unstakeNft(
  accounts: UnstakeNftAccounts,
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
    { pubkey: accounts.nftStakeProof, isSigner: false, isWritable: true },
    {
      pubkey: accounts.metaplexMetadataAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.nftMint, isSigner: false, isWritable: false },
    { pubkey: accounts.nftToken, isSigner: false, isWritable: true },
    { pubkey: accounts.elementumMint, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingPool, isSigner: false, isWritable: true },
    { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.nftEdition, isSigner: false, isWritable: true },
    {
      pubkey: accounts.metaplexTokenMetadataProgram,
      isSigner: false,
      isWritable: false,
    },
  ]
  const identifier = Buffer.from([17, 182, 24, 211, 101, 138, 50, 163])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
