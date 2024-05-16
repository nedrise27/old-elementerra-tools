import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitProgramSignerAccounts {
  systemProgram: PublicKey
  rent: PublicKey
  authority: PublicKey
  programSigner: PublicKey
  solVault: PublicKey
}

export function initProgramSigner(
  accounts: InitProgramSignerAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: true },
    { pubkey: accounts.programSigner, isSigner: false, isWritable: true },
    { pubkey: accounts.solVault, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([251, 218, 99, 112, 114, 36, 190, 40])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
