import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitElementArgs {
  name: string
  numberOfRewards: number
  hash: Array<number>
  elementRequired: Array<PublicKey>
  tier: types.TierKind
  cost: BN | null
}

export interface InitElementAccounts {
  systemProgram: PublicKey
  rent: PublicKey
  authority: PublicKey
  season: PublicKey
  element: PublicKey
}

export const layout = borsh.struct([
  borsh.str("name"),
  borsh.u16("numberOfRewards"),
  borsh.array(borsh.u8(), 32, "hash"),
  borsh.array(borsh.publicKey(), 4, "elementRequired"),
  types.Tier.layout("tier"),
  borsh.option(borsh.u64(), "cost"),
])

export function initElement(
  args: InitElementArgs,
  accounts: InitElementAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: true },
    { pubkey: accounts.season, isSigner: false, isWritable: true },
    { pubkey: accounts.element, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([105, 252, 46, 127, 153, 247, 24, 251])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      name: args.name,
      numberOfRewards: args.numberOfRewards,
      hash: args.hash,
      elementRequired: args.elementRequired,
      tier: args.tier.toEncodable(),
      cost: args.cost,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
