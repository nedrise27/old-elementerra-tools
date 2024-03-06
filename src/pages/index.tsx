import {
    AppBar,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import Head from 'next/head';
import { CrystalsTable } from '../app/components/CrystalsTable';
import { Header } from '../app/components/Header';
import { OtherNftsTable } from '../app/components/OtherNftsTable';
import { RabbitsTable } from '../app/components/RabbitsTable';
import { useAssetStore } from '../app/stores/assets';
import { useEleSolPriceStore, useEleUsdcPriceStore } from '../app/stores/prices';
import styles from '../styles/Home.module.css';
import { WalletInput } from '../app/components/WalletInput';
import { DAS } from 'helius-sdk';

export default function Home() {
    const wallets = useAssetStore((state) => state.wallets);
    const assetsLoadingState = useAssetStore((state) => state.loadingState);

    const [elements, setElements] = useState<DAS.GetAssetResponse[]>([]);

    useEffect(() => {
        let els: DAS.GetAssetResponse[] = [];
        for (const assets of Object.values(wallets)) {
            els = [...els, ...assets.elements];
        }
        setElements(els);
    }, [wallets]);

    return (
        <>
            <Head>
                <title>Elementerra tools</title>
                <meta name="description" content="Tools for Elementerra.io players, created by @nedrise." />
            </Head>

            <div className={styles.Container}>
                <main className={styles.Main}>
                    <Box className={styles.Inputs}>
                        <h4 style={{ color: 'orange' }}>
                            Due to new cNFT crystals using custodial staking now, income calculation is not working
                            anymore.
                        </h4>
                    </Box>
                </main>
            </div>
        </>
    );
}
