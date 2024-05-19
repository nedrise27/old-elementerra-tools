import { create } from 'zustand';

type ConfigStore = {
    txFees: number;
    updateTxFees: (newFees: number) => void;
};

const DEFAULT_TX_FEES = 50000;

export const useConfigStore = create<ConfigStore>((set, get) => {
    return {
        txFees: DEFAULT_TX_FEES,
        updateTxFees: (newFees: number) => {
            set((state) => ({
                ...state,
                txFees: newFees,
            }));
        },
    };
});
