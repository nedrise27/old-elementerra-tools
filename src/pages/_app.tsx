import { ThemeProvider, createTheme } from '@mui/material';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useMemo } from 'react';
import { Footer } from '../app/components/Footer';
import { Header } from '../app/components/Header';
import styles from '../styles/App.module.css';

// Use require instead of import since order matters
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

export const ELEMENTERRA_PROGRAM_ID = 'ELEMisgsfkmp58w1byRvrdpGG1HcapQoCrmMJeorBCxq';
export const ELEMENTERRA_CREATORS = [
    'B9G4GndCu93zFXxyeA6nbWhBHDAdL8ACwxeCL6wMXycZ',
    '4oZFNzopnabpEFz1TM2j3B4EasPGVcBzaVea2Qp1h2Ep',
];

export const ELEMENTERRA_RABBITS_COLLECTION = '4n4zLe1BcREy9XQyHwSMJJHR4YHn7AgP2dx4jL6X8GGR';
export const ELEMENTERRA_INVENTOR_COLLECTION = 'BsoRSTtiE4DSuNXTkwjTjnZADKa9fWct8a4CncaUYdDD';
export const ELEMENTERRA_CRYSTALS_COLLECTION = 'C2Frjbg6DosmE3GSbb8veTxGg8H7kS73FzduYh3b8er9';
export const ELEMENTERRA_CRYSTALS_COLLECTION2 = 'GsWtWwZLkS9Ee9Rb13MuTG3JfQx3nhh16ps36ZNEPcdW';
export const ELEMENTERRA_ELEMENTS_COLLECTION = 'CdES51P2ThUZsgAeqFG42k59QchQMWBR9hLLeUGeB2gL';

export default function MyApp({ Component, pageProps }: AppProps) {
    // You can also provide a custom RPC endpoint
    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl('mainnet-beta');

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    const wallets = useMemo(() => [], [endpoint]);

    return (
        <>
            <Head>
                <title>Elementerra tools</title>
                <meta name="description" content="Tools for Elementerra.io players, created by @nedrise." />
            </Head>
            <ThemeProvider theme={darkTheme}>
                <ConnectionProvider endpoint={endpoint}>
                    <WalletProvider wallets={wallets} autoConnect>
                        <WalletModalProvider>
                            <Header />
                            <div className={styles.App}>
                                <Component {...pageProps} />
                            </div>
                            <Footer />
                        </WalletModalProvider>
                    </WalletProvider>
                </ConnectionProvider>
            </ThemeProvider>
        </>
    );
}
