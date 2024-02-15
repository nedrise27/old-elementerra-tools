import { AppBar } from '@mui/material';
import styles from '../../styles/Footer.module.css';
import Link from 'next/link';

export function Footer() {
    return (
        <AppBar position="static">
            <div className={styles.Footer}>
                <div className={styles.Note}>
                    <Link href="https://github.com/nedrise27/elementerra-tools" target="_blank">
                        GitHub repository
                    </Link>
                </div>

                <div className={styles.Note}>
                    Custom RPC endpoint. Please use in fair way:{' '}
                    <strong>{process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT}</strong>
                </div>

                <span>
                    Made by{' '}
                    <a href="https://github.com/nedrise27?tab=repositories" target="_blank" rel="noreferrer">
                        nedrise
                    </a>
                </span>
            </div>
        </AppBar>
    );
}
