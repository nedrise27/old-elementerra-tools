import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface SetInventorAccounts {
  systemProgram: PublicKey
  rent: PublicKey
  authority: PublicKey
  user: PublicKey
  programSigner: PublicKey
  season: PublicKey
  element: PublicKey
}

export function setInventor(
  accounts: SetInventorAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: true },
    { pubkey: accounts.user, isSigner: false, isWritable: false },
    { pubkey: accounts.programSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.season, isSigner: false, isWritable: false },
    { pubkey: accounts.element, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([46, 111, 105, 64, 65, 24, 93, 200])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
