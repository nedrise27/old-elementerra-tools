import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface DeleteElementArgs {
  hash: Array<number>
}

export interface DeleteElementAccounts {
  systemProgram: PublicKey
  rent: PublicKey
  authority: PublicKey
  season: PublicKey
  element: PublicKey
}

export const layout = borsh.struct([borsh.array(borsh.u8(), 32, "hash")])

export function deleteElement(
  args: DeleteElementArgs,
  accounts: DeleteElementAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: true },
    { pubkey: accounts.season, isSigner: false, isWritable: true },
    { pubkey: accounts.element, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([128, 64, 33, 118, 186, 80, 177, 247])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      hash: args.hash,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
