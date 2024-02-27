import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { encode as encodeb58 } from 'bs58';
import { DAS, Helius } from 'helius-sdk';
import _ from 'lodash';
import { create } from 'zustand';
import { RABBITS_ELE_PER_HOUR } from '../../lib/constants';
import { OTHER_STAKABLE_NFT_COLLECTIONS } from '../../lib/constants/otherNfts';
import { LoadingState } from '../../lib/utils';
import {
    ELEMENTERRA_ELEMENTS_COLLECTION,
    ELEMENTERRA_PROGRAM_ID,
    ELEMENTERRA_RABBITS_COLLECTION,
} from '../../pages/_app';

export type Stakable = {
    nft: DAS.GetAssetResponse;
    level: string;
    elePerHour: number;
};

type AssetsStoreAssets = {
    rabbits: Stakable[];
    rabbitsElePerHour: number;
    crystals: Stakable[];
    crystalsElePerHour: number;
    otherNFTs: Stakable[];
    otherNFTsElePerHour: number;
    elements: DAS.GetAssetResponse[];
};

type AssetsStore = {
    loadingState: LoadingState;
    wallets: Record<string, AssetsStoreAssets>;
    addWallet: (ownerAddress: string) => Promise<void>;
    removeWallet: (ownerAddress: string) => Promise<void>;
};

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl('mainnet-beta'));
// const helius = new Helius(process.env.NEXT_PUBLIC_HELIUS_API_KEY!);
const metaplex = Metaplex.make(connection);

function isInCollection(nft: DAS.GetAssetResponse, collection: string): boolean {
    return !_.isNil(nft.grouping?.find((g) => g.group_key === 'collection' && g.group_value === collection));
}

async function getRabbitLevel(rabbit: DAS.GetAssetResponse): Promise<number> {
    const metadataAddress = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: new PublicKey(rabbit.id) })
        .toString();
    const url = `https://api.helius.xyz/v0/addresses/${metadataAddress}/transactions?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}&type=COMPRESSED_NFT_BURN`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        },
    });
    const data = await res.json();
    return data.length;
}

export const useAssetStore = create<AssetsStore>((set, get) => {
    async function addWallet(ownerAddress: string) {
        return; // TODO: find a way to get staked Crystals

        // if (!_.isNil(get().wallets[ownerAddress])) {
        //     return;
        // }

        // set((state) => ({
        //     ...state,
        //     loadingState: 'loading',
        // }));

        // const limit = 1000;
        // let page = 1;
        // let sanityCheck = 0;
        // let fetched = 0;

        // let unburned: DAS.GetAssetResponse[] = [];

        // while (true) {
        //     const res = await helius.rpc.getAssetsByOwner({
        //         ownerAddress,
        //         page,
        //         limit,
        //         displayOptions: {
        //             showGrandTotal: true,
        //         },
        //     });
        //     unburned = [...unburned, ...res.items.filter((item) => !item.burnt)];
        //     fetched += limit;

        //     if (_.isNil(res.grand_total) || !_.isNumber(res.grand_total)) {
        //         break;
        //     }
        //     if (fetched > res.grand_total) {
        //         break;
        //     }

        //     if (sanityCheck > 20) {
        //         break;
        //     }
        //     sanityCheck++;
        //     page++;
        // }

        // const rabbitsRes = unburned.filter((item) => isInCollection(item, ELEMENTERRA_RABBITS_COLLECTION));

        // const rabbitLevels = await Promise.all(rabbitsRes.map(getRabbitLevel));

        // let rabbitsElePerHour = 0;
        // const rabbits: Stakable[] = [];
        // for (const [res, lvl] of _.zip(rabbitsRes, rabbitLevels)) {
        //     if (!_.isNil(res) && !_.isNil(lvl)) {
        //         const level = lvl.toString();
        //         const elePerHour = RABBITS_ELE_PER_HOUR[level];
        //         rabbitsElePerHour += elePerHour;
        //         rabbits.push({ nft: res, level, elePerHour });
        //     }
        // }

        // // const crystalsRes = unburned.filter(
        // //     (item) =>
        // //         isInCollection(item, ELEMENTERRA_CRYSTALS_COLLECTION) ||
        // //         isInCollection(item, ELEMENTERRA_CRYSTALS_COLLECTION2)
        // // );
        // let crystalsElePerHour = 0;
        // const crystals: Stakable[] = [];
        // // for (const crystal of crystalsRes) {
        // //     const level = crystal.content?.metadata?.attributes?.find((a) => a.trait_type == 'level')?.value!;
        // //     const elePerHour = CRYSTALS_ELE_PER_HOUR[level];
        // //     crystalsElePerHour += elePerHour;
        // //     crystals.push({
        // //         nft: crystal,
        // //         level,
        // //         elePerHour,
        // //     });
        // // }
        // const crystalsRes = await connection.getProgramAccounts(new PublicKey(ELEMENTERRA_PROGRAM_ID), {
        //     encoding: 'base64',
        //     filters: [
        //         {
        //             memcmp: {
        //                 offset: 0,
        //                 bytes: '6BJNiWbhqnj',
        //             },
        //         },
        //         {
        //             memcmp: {
        //                 offset: 9,
        //                 bytes: ownerAddress,
        //             },
        //         },
        //     ],
        // });

        // for (const res of crystalsRes) {
        //     const data = res.account.data;

        //     const first = data.subarray(0, 9);
        //     // console.log(data.toString('hex'));
        //     const second = encodeb58(data.subarray(9, 9 + 32));
        //     console.log(second);
        // }

        // const elements = unburned.filter((item) => isInCollection(item, ELEMENTERRA_ELEMENTS_COLLECTION));

        // const otherNFTs: Stakable[] = [];
        // let otherNFTsElePerHour = 0;
        // for (const nft of unburned) {
        //     const collectionGroup = nft.grouping?.find((g) => g.group_key === 'collection');
        //     if (!_.isNil(collectionGroup)) {
        //         const collection = OTHER_STAKABLE_NFT_COLLECTIONS[collectionGroup.group_value];
        //         if (!_.isNil(collection)) {
        //             otherNFTsElePerHour += collection.elePerHour;
        //             otherNFTs.push({
        //                 nft,
        //                 level: '',
        //                 elePerHour: collection.elePerHour,
        //             });
        //         }
        //     }
        // }

        // set((state) => ({
        //     ...state,
        //     loadingState: 'loaded',
        //     wallets: {
        //         ...state.wallets,
        //         [ownerAddress]: {
        //             rabbits,
        //             rabbitsElePerHour,
        //             crystals,
        //             crystalsElePerHour,
        //             otherNFTs,
        //             otherNFTsElePerHour,
        //             elements,
        //         },
        //     },
        // }));
    }

    async function removeWallet(ownerAddress: string) {
        set((state) => ({
            ...state,
            loadingState: 'loading',
        }));
        set((state) => {
            const w = _.clone(state.wallets);
            delete w[ownerAddress];
            return {
                ...state,
                wallets: {
                    ...w,
                },
                loadingState: 'loaded',
            };
        });
    }

    return {
        loadingState: 'initial',
        wallets: {},
        addWallet,
        removeWallet,
    };
});
