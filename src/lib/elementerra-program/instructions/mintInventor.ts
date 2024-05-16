import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface MintInventorArgs {
  elementName: types.ElementNameKind
}

export interface MintInventorAccounts {
  associatedTokenProgram: PublicKey
  tokenProgram: PublicKey
  systemProgram: PublicKey
  rent: PublicKey
  authority: PublicKey
  programSigner: PublicKey
  inventorCardMetaplexMetadataAccount: PublicKey
  inventorCardNftMint: PublicKey
  inventorCardNftToken: PublicKey
  inventorNftEdition: PublicKey
  inventorCardCollectionMint: PublicKey
  inventorCardCollectionMetadata: PublicKey
  inventorCardCollectionMasterEdition: PublicKey
  metaplexTokenMetadataProgram: PublicKey
}

export const layout = borsh.struct([types.ElementName.layout("elementName")])

export function mintInventor(
  args: MintInventorArgs,
  accounts: MintInventorAccounts,
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
    {
      pubkey: accounts.inventorCardMetaplexMetadataAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.inventorCardNftMint, isSigner: true, isWritable: true },
    {
      pubkey: accounts.inventorCardNftToken,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.inventorNftEdition, isSigner: false, isWritable: true },
    {
      pubkey: accounts.inventorCardCollectionMint,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: accounts.inventorCardCollectionMetadata,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: accounts.inventorCardCollectionMasterEdition,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: accounts.metaplexTokenMetadataProgram,
      isSigner: false,
      isWritable: false,
    },
  ]
  const identifier = Buffer.from([89, 188, 122, 136, 223, 51, 71, 97])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      elementName: args.elementName.toEncodable(),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
