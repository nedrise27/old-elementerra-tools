import { AppBar, Box } from '@mui/material';
import _ from 'lodash';
import Link from 'next/link';

import { useEffect } from 'react';
import styles from '../../styles/Header.module.css';
import { useEleSolPriceStore, useEleUsdcPriceStore, useRabbitPriceStore } from '../stores/prices';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Header() {
    const eleSolPrice = useEleSolPriceStore((state) => state.price);
    const refreshEleSolPrice = useEleSolPriceStore((state) => state.fetch);
    const eleUsdcPrice = useEleUsdcPriceStore((state) => state.price);
    const refreshEleUsdcPrice = useEleUsdcPriceStore((state) => state.fetch);
    const rabbitBasePrice = useRabbitPriceStore((state) => state.price);
    const fetchRabbitBasePrice = useRabbitPriceStore((state) => state.fetch);

    useEffect(() => {
        refreshEleSolPrice();
        refreshEleUsdcPrice();
        fetchRabbitBasePrice();
    }, [refreshEleSolPrice, refreshEleUsdcPrice]);

    return (
        <>
            <AppBar position="static" className={styles.AppBar}>
                <nav className={styles.Navigation}>
                    <Link href={'/'}>Calculator</Link>
                    <Link href={'/elements'}>Elements</Link>
                    <Link href={'/invent'}>Invent</Link>
                    <Link href={'/chasing-chests'}>Chasing Chests</Link>
                    <Link href={'/roi'}>Roi Tables</Link>
                    <Link href={'/feed'}>Forging Feed</Link>
                    <Link href={'/leveling'}>Level Up</Link>
                    <Link href={'/buy-elements'}>Buy Elements</Link>
                    <Link href={'/crystals-stake'}>Crystals Stake</Link>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                </nav>

                <div className={styles.HeaderInfo}>
                    <p>Rabbit FP: {_.round(rabbitBasePrice || 0, 2).toFixed(2)} SOL</p>
                    <p>ELE/SOL: {_.round(eleSolPrice || 0, 8).toFixed(10)} SOL</p>
                    <p>ELE/USDC: {_.round(eleUsdcPrice || 0, 8).toFixed(8)} USDC</p>
                </div>
            </AppBar>
        </>
    );
}
