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

    const addWallet = useAssetStore((state) => state.addWallet);
    const removeWallet = useAssetStore((state) => state.removeWallet);
    const wallets = useAssetStore((state) => state.wallets);

    const [walletAddress, setWalletAddress] = useState('');

    function handleWalletAddressInput(address: string) {
        setWalletAddress(address);
    }

    async function handleWalletSubmit(event: FormEvent) {
        event.preventDefault();
        await addWallet(walletAddress);
        setWalletAddress('');
    }

    function handleRemoveWallet(address: string) {
        removeWallet(address);
        setWalletAddress('');
    }

    useEffect(() => {
        refreshEleSolPrice();
        refreshEleUsdcPrice();
    }, [refreshEleSolPrice, refreshEleUsdcPrice]);

    return (
        <>
            <AppBar position="static">
                <nav className={styles.Navigation}>
                    <div className={styles.Note}>
                        Custom RPC endpoint. Please use in fair way:{' '}
                        <strong>{process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT}</strong>
                    </div>
                    <div className={styles.Note}>
                        <Link href="https://github.com/nedrise27/elementerra-tools" target="_blank">
                            GitHub repository
                        </Link>
                    </div>
                    <div className={styles.NavItems}>
                        <Link href={'/'}>Home</Link>
                        <Link href={'/chasing-chests'}>Chasing Chests</Link>
                        <Link href={'/invent'}>Invent</Link>
                        <Link href={'/roi'}>Roi Tables</Link>
                        <Link href={'/elements'}>Elements</Link>
                        <Link href={'/feed'}>Forging Feed</Link>
                    </div>
                </nav>
                <div className={styles.Header}>
                    <form style={{ minWidth: '500px', display: 'flex', gap: '0.4rem' }} onSubmit={handleWalletSubmit}>
                        <TextField
                            fullWidth
                            label="Wallet Address"
                            id="walletAddress"
                            variant="outlined"
                            value={walletAddress}
                            onChange={(event) => handleWalletAddressInput(event.target.value)}
                        />
                        <Button type="submit" variant="outlined">
                            load
                        </Button>
                    </form>

                    <div>
                        {Object.keys(wallets).map((w) => (
                            <ViewWalletAddressTag key={w} walletAddress={w} onRemove={handleRemoveWallet} />
                        ))}
                    </div>

                    <div className={styles.globalStats}>
                        <p>ELE/SOL: {_.round(eleSolPrice || 0, 8).toFixed(10)} SOL</p>
                        <p>ELE/USDC: {_.round(eleUsdcPrice || 0, 8).toFixed(8)} USDC</p>
                    </div>
                </div>
            </AppBar>
        </>
    );
}

type ViewWalletTagProps = {
    walletAddress: string;
    onRemove: (walletAddress: string) => void;
};

function ViewWalletAddressTag(props: ViewWalletTagProps) {
    return (
        <Button
            sx={{ marginRight: '0.2rem' }}
            variant="outlined"
            color="error"
            endIcon={<Delete />}
            onClick={() => props.onRemove(props.walletAddress)}
        >
            {props.walletAddress.slice(0, 6)}
        </Button>
    );
}
