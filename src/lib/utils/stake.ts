import { Connection, PublicKey } from '@solana/web3.js';
import _ from 'lodash';
import { ELEMENTERRA_PROGRAM_ID } from '../../pages/_app';
import { NftStakeProof } from '../elementerra-program/accounts';

export async function fetchNftStakeProofs(
    connection: Connection,
    publicKey: string
): Promise<[NftStakeProof, PublicKey][]> {
    const res = await connection.getProgramAccounts(new PublicKey(ELEMENTERRA_PROGRAM_ID), {
        filters: [
            {
                memcmp: {
                    bytes: '6BJNiWbhqnj',
                    offset: 0,
                },
            },
            {
                memcmp: {
                    bytes: publicKey,
                    offset: 9,
                },
            },
        ],
    });

    return res.map((r) => [NftStakeProof.decode(r.account.data), r.pubkey]);
}
