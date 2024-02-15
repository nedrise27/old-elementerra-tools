import { create } from 'zustand';
import _ from 'lodash';

import { CRYSTALS_ELE_PER_HOUR } from '../../lib/constants';
import { CHESTS_TIERS } from '../../lib/constants/chests';

type PriceStore = {
    price: number;
    fetch: () => Promise<void>;
};

export const useEleSolPriceStore = create<PriceStore>((set) => ({
    price: 0,
    fetch: async () => {
        const res = await fetch('https://price.jup.ag/v4/price?ids=ELE&vsToken=SOL');
        const body = await res.json();
        set({ price: body?.data?.ELE?.price || 0 });
    },
}));

export const useEleUsdcPriceStore = create<PriceStore>((set) => ({
    price: 0,
    fetch: async () => {
        const res = await fetch('https://price.jup.ag/v4/price?ids=ELE&vsToken=USDC');
        const body = await res.json();
        set({ price: body?.data?.ELE?.price || 0 });
    },
}));

type PricesStore = {
    prices: Record<string, number | null>;
    fetch: () => Promise<void>;
};

async function fetchCrystalPrice(level: number | string) {
    const res = await fetch(`https://elementerra.line27.de/nft-prices/elementerra_crystals/` + level);
    return res.json();
}

export const useCrystalPricesStore = create<PricesStore>((set, get) => ({
    prices: {},
    fetch: async () => {
        const crystalLevels = Object.keys(CRYSTALS_ELE_PER_HOUR);

        for (const level of crystalLevels) {
            const res = await fetchCrystalPrice(level);
            set((state) => ({
                prices: {
                    ...state.prices,
                    ...{
                        [level]: res.priceInSol,
                    },
                },
            }));
        }
    },
}));

export const useRabbitPriceStore = create<PriceStore>((set, get) => ({
    price: 0,
    fetch: async () => {
        const res = await fetch('https://elementerra.line27.de/nft-prices/elementerra_rabbits/0');
        const body = await res.json();
        set({ price: body.priceInSol });
    },
}));

async function fetchChestPrice(level: number | string) {
    try {
        const res = await fetch(`https://elementerra.line27.de/nft-prices/elementerra_chests/` + level);
        return res.json();
    } catch (err) {
        console.error(err);
    }
}

export const useChestPricesStore = create<PricesStore>((set, get) => ({
    prices: {},
    fetch: async () => {
        for (const tier of CHESTS_TIERS) {
            const res = await fetchChestPrice(tier);
            if (!_.isNil(res)) {
                set((state) => ({
                    prices: {
                        ...state.prices,
                        ...{
                            [tier]: res.priceInSol,
                        },
                    },
                }));
            }
        }
    },
}));
