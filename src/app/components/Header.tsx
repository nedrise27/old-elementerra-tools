import { AppBar, Box, TextField } from '@mui/material';
import _ from 'lodash';
import Link from 'next/link';

import { useEffect } from 'react';
import styles from '../../styles/Header.module.css';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConfigStore } from '../stores/config';

export function Header() {
    const txFees = useConfigStore((state) => state.txFees);
    const updateTxFees = useConfigStore((state) => state.updateTxFees);

    function handleUpdateTransactionFees(fees: string) {
        try {
            const newFees = parseInt(fees, 10);
            if (newFees) {
                updateTxFees(newFees);
            }
        } catch (err) {
            console.error(err);
        }
    }

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
                </nav>
                <div className={styles.Navigation}>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    <TextField
                        sx={{ maxWidth: '10rem' }}
                        type="number"
                        label="Tx fee in lamports"
                        value={txFees}
                        onChange={(event) => handleUpdateTransactionFees(event.target.value)}
                    />
                </div>
            </AppBar>
        </>
    );
}
