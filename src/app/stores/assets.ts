import { Connection, clusterApiUrl } from '@solana/web3.js';
import { DAS, RpcClient } from 'helius-sdk';
import _ from 'lodash';
import { create } from 'zustand';
import { LoadingState, asyncSleep } from '../../lib/utils';
import { ELEMENTERRA_CREATORS, ELEMENTERRA_ELEMENTS_COLLECTION } from '../../pages/_app';

export type Stakable = {
    nft: DAS.GetAssetResponse;
    level: string;
    elePerHour: number;
};

type AssetsStoreAssets = {
    elements: DAS.GetAssetResponse[];
};

type AssetsStore = {
    loadingState: LoadingState;
    wallets: Record<string, AssetsStoreAssets>;
    addWallet: (ownerAddress: string) => Promise<void>;
    removeWallet: (ownerAddress: string) => Promise<void>;
};

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl('mainnet-beta'));
const helius = new RpcClient(connection, 'elementerra-tools');

function isInCollection(nft: DAS.GetAssetResponse, collection: string): boolean {
    return !_.isNil(nft.grouping?.find((g) => g.group_key === 'collection' && g.group_value === collection));
}

export const useAssetStore = create<AssetsStore>((set, get) => {
    async function addWallet(ownerAddress: string) {
        if (!_.isNil(get().wallets[ownerAddress])) {
            return;
        }

        set((state) => ({
            ...state,
            loadingState: 'loading',
        }));

        const limit = 1000;
        let page = 1;
        let sanityCheck = 0;
        let fetched = 0;

        let elements: DAS.GetAssetResponse[] = [];

        while (true) {
            const res = await helius.searchAssets({
                ownerAddress,
                compressed: true,
                creatorAddress: ELEMENTERRA_CREATORS[1],
                grouping: ['collection', ELEMENTERRA_ELEMENTS_COLLECTION],
                burnt: false,
                page,
                limit,
            });
            if (_.isNil(res)) {
                break;
            }
            elements = [...elements, ...res.items];
            fetched += limit;

            if (_.isNil(res.total) || !_.isNumber(res.total)) {
                break;
            }
            if (res.total <= res.limit) {
                break;
            }

            if (sanityCheck > 20) {
                break;
            }
            sanityCheck++;
            page++;
            if (page > 2) {
                await asyncSleep(1000);
            }
        }

        set((state) => ({
            ...state,
            loadingState: 'loaded',
            wallets: {
                ...state.wallets,
                [ownerAddress]: {
                    elements,
                },
            },
        }));
    }

    async function removeWallet(ownerAddress: string) {
        set((state) => ({
            ...state,
            loadingState: 'loading',
        }));
        set((state) => {
            const w = _.clone(state.wallets);
            delete w[ownerAddress];
            const loadingState = _.isEmpty(w) ? 'initial' : 'loaded';
            return {
                ...state,
                wallets: {
                    ...w,
                },
                loadingState,
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
