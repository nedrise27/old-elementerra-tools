import { AppBar, Button, TextField } from '@mui/material';
import _ from 'lodash';
import Link from 'next/link';

import styles from '../../styles/Header.module.css';
import { useEleSolPriceStore, useEleUsdcPriceStore } from '../stores/prices';
import { FormEvent, useEffect, useState } from 'react';
import { useAssetStore } from '../stores/assets';
import { Delete } from '@mui/icons-material';

export function Header() {
    const eleSolPrice = useEleSolPriceStore((state) => state.price);
    const refreshEleSolPrice = useEleSolPriceStore((state) => state.fetch);
    const eleUsdcPrice = useEleUsdcPriceStore((state) => state.price);
    const refreshEleUsdcPrice = useEleUsdcPriceStore((state) => state.fetch);

    useEffect(() => {
        refreshEleSolPrice();
        refreshEleUsdcPrice();
    }, [refreshEleSolPrice, refreshEleUsdcPrice]);

    return (
        <>
            <AppBar
                position="static"
                sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', padding: '0.5rem 2rem' }}
            >
                <div>
                    <p>ELE/SOL: {_.round(eleSolPrice || 0, 8).toFixed(10)} SOL</p>
                    <p>ELE/USDC: {_.round(eleUsdcPrice || 0, 8).toFixed(8)} USDC</p>
                </div>

                <nav className={styles.Navigation}>
                    <Link href={'/'}>Home</Link>
                    <Link href={'/elements'}>Elements</Link>
                    <Link href={'/invent'}>Invent</Link>
                    <Link href={'/chasing-chests'}>Chasing Chests</Link>
                    <Link href={'/roi'}>Roi Tables</Link>
                    <Link href={'/feed'}>Forging Feed</Link>
                </nav>
            </AppBar>
        </>
    );
}

