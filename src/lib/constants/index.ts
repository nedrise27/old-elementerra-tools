export * from './crystals';
export * from './rabbits';

import { PublicKey } from '@solana/web3.js';

export const SEASON_NUMBER = 1;

export const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111');
export const RENT_PROGRAM = new PublicKey('SysvarRent111111111111111111111111111111111');
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

export const METAPLEX_METADATA_ACCOUNT = new PublicKey('4gC1nUpX8XVBtZnRS6qpjtMCeCAHEn1x2t4JnQSyipAU');
export const METAPLEX_TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
export const BUBBLEGUM_PROGRAM = new PublicKey('BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY');
export const BUBBLEGUM_SIGNER = new PublicKey('4ewWZC5gT6TGpm5LZNDs9wVonfUT2q5PP5sc9kVbwMAK');
export const STATE_COMPRESSION_PROGRAM = new PublicKey('cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK');
export const TREE_AUTHORITY = new PublicKey('7ZGx76bdL83ZCtXWteZ3XEXsEH6QypXBAQUVTgYd7Txe');
export const COLLECTION_MINT = new PublicKey('CdES51P2ThUZsgAeqFG42k59QchQMWBR9hLLeUGeB2gL');
export const COLLECTION_METADATA = new PublicKey('Cwxpou94PrhwzFj5RRqvr4fgWptDngmjdhmgLw8x8uvd');
export const COLLECTION_MASTER_EDITION = new PublicKey('E9X35rsDon2Xqr6Gmcyyjeh3GwgieJMqe9mECbqwfGqr');

export const ELEMENTERRA_CREATORS = [
    'B9G4GndCu93zFXxyeA6nbWhBHDAdL8ACwxeCL6wMXycZ',
    '4oZFNzopnabpEFz1TM2j3B4EasPGVcBzaVea2Qp1h2Ep',
];
export const ELEMENTERRA_ELEMENTS_COLLECTION = 'CdES51P2ThUZsgAeqFG42k59QchQMWBR9hLLeUGeB2gL';
export const ELEMENTUM_MINT = new PublicKey('8A9HYfj9WAMgjxARWVCJHAeq9i8vdN9cerBmqUamDj7U');
export const SEASON = new PublicKey('DwcKm8uveH7WPXTrkriQAd4mYfqK2JSSAaptJvxTLmwS');
export const LOG_WRAPPER_ACCOUNT = new PublicKey('noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV');

export const EL_PROGRAM_SIGNER = new PublicKey('8ZCqJ3GXiXsmwqLnXbyBL5U7Tu59k6p4HwXc8ijfgQfU');
export const EL_SOL_RECEIVER = new PublicKey('4oZFNzopnabpEFz1TM2j3B4EasPGVcBzaVea2Qp1h2Ep');
export const EL_SOL_VAULT = new PublicKey('EnRTj2Fb34naS6jiUhJKRX4GmtKLadcez7TvQe1PL5FC');

export const ELEMENT_MERKLE_TREE = new PublicKey('BjmgoKdoxRqBgQJnUWZ1TZUzKh2UtBEVEBShQHx95wXX');
export const ELEMENT_TREE_AUTHORITY = new PublicKey('7ZGx76bdL83ZCtXWteZ3XEXsEH6QypXBAQUVTgYd7Txe');

export const PACK_TREE_AUTHORITY = new PublicKey('3CjL2c94VXhjxqdSgNV7pSFPJfLZSFp6FnDZxjrrMuUB');
export const PACK_MERKLE_TREE = new PublicKey('5soqPsikPLnpRwrxFXebGxEzPssN7w6vUD5CDt8MHuGX');
export const PACK_COLLECTION_MINT = new PublicKey('5LkHs8vFFkjgN6pnmPsvgUDn9iN4yj8h2qSoejuHtKoJ');
export const PACK_COLLECTION_METADATA = new PublicKey('5QRmyNo1bCaWgX9hJHDVfrDHnCa8sYKmfu3dTuYEegci');
export const PACK_COLLECTION_MASTER_EDITION = new PublicKey('Bz7vRf1kG3VFhM3eHRGoEJGe2Wu9jpw7ZkMGgqBaXYMt');

export const CRYSTAL_MERKLE_TREE = new PublicKey('5soqPsikPLnpRwrxFXebGxEzPssN7w6vUD5CDt8MHuGX');
export const CRYSTAL_STAKING_POOL = new PublicKey('Cgig1KrCVH5PBCTnCwkFwsDYDvFCvYuKQ7tz7ZjFiwJi');
export const CRYSTAL_TREE_AUTHORITY = new PublicKey('3CjL2c94VXhjxqdSgNV7pSFPJfLZSFp6FnDZxjrrMuUB');
