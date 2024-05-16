import { Refresh } from '@mui/icons-material';
import {
    Box,
    IconButton,
    InputLabel,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import _ from 'lodash';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { useEleSolPriceStore, useEleUsdcPriceStore } from '../app/stores/prices';
import { calculatePrice, toFixedNoTralingZeroes } from '../lib/utils';
import styles from '../styles/Home.module.css';

export default function Home() {
    const eleSolPrice = useEleSolPriceStore((state) => state.price);
    const refreshEleSolPrice = useEleSolPriceStore((state) => state.fetch);
    const eleUsdcPrice = useEleUsdcPriceStore((state) => state.price);
    const refreshEleUsdcPrice = useEleUsdcPriceStore((state) => state.fetch);

    const [elePerHour, setElePerHour] = useState(1000);

    function handleAmountChange(value: string) {
        const a = parseInt(value, 10);
        if (_.isInteger(a) && !_.isNaN(a) && a > 0) {
            setElePerHour(a);
            localStorage.setItem('userElePerHour', a.toString());
        } else {
            setElePerHour(1000);
        }
    }

    async function refreshPrices() {
        await refreshEleSolPrice();
        await refreshEleUsdcPrice();
    }

    useEffect(() => {
        refreshPrices();
        const savedElePerHour = localStorage.getItem('userElePerHour');
        if (!_.isNil(savedElePerHour)) {
            setElePerHour(parseInt(savedElePerHour));
        }
    }, []);

    return (
        <>
            <div className={styles.Container}>
                <main className={styles.Main}>
                    <Typography sx={{ marginTop: '2rem' }} variant="h6" component="h2">
                        ELE income
                    </Typography>

                    <Box
                        sx={{
                            minWidth: '600px',
                            maxWidth: '1080px',
                            margin: '1rem auto',
                            padding: '1rem',
                            boxSizing: 'border-box',
                            border: '1px solid grey',
                            borderRadius: '8px',
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2rem',
                            }}
                        >
                            <InputLabel sx={{ fontSize: 'large', fontWeight: 'bold' }}>ELE / h: </InputLabel>

                            <TextField
                                type="number"
                                value={elePerHour}
                                onChange={(event) => handleAmountChange(event.target.value)}
                            />

                            <IconButton onClick={() => refreshPrices()}>
                                <Refresh />
                            </IconButton>
                        </div>

                        <TableContainer
                            component={Paper}
                            sx={{ maxHeight: '75vh', maxWidth: 1200, margin: '1rem auto' }}
                        >
                            <Table stickyHeader aria-label="ELE production table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Period</TableCell>
                                        <TableCell>ELE</TableCell>
                                        <TableCell>USDC</TableCell>
                                        <TableCell>SOL</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow key="hour">
                                        <TableCell>Hour</TableCell>
                                        <TableCell>{elePerHour} ELE</TableCell>
                                        <TableCell>
                                            {toFixedNoTralingZeroes(calculatePrice(eleUsdcPrice, elePerHour), 2)} USDC
                                        </TableCell>
                                        <TableCell>{calculatePrice(eleSolPrice, elePerHour)} SOL</TableCell>
                                    </TableRow>
                                    <TableRow key="day">
                                        <TableCell>24 hours</TableCell>
                                        <TableCell>{elePerHour * 24} ELE</TableCell>
                                        <TableCell>
                                            {toFixedNoTralingZeroes(calculatePrice(eleUsdcPrice, elePerHour * 24), 2)}{' '}
                                            USDC
                                        </TableCell>
                                        <TableCell>{calculatePrice(eleSolPrice, elePerHour * 24)} SOL</TableCell>
                                    </TableRow>
                                    <TableRow key="week">
                                        <TableCell>7 days</TableCell>
                                        <TableCell>{elePerHour * 24 * 7} ELE</TableCell>
                                        <TableCell>
                                            {toFixedNoTralingZeroes(
                                                calculatePrice(eleUsdcPrice, elePerHour * 24 * 7),
                                                2
                                            )}{' '}
                                            USDC
                                        </TableCell>
                                        <TableCell>{calculatePrice(eleSolPrice, elePerHour * 24 * 7)} SOL</TableCell>
                                    </TableRow>
                                    <TableRow key="month">
                                        <TableCell>30 days</TableCell>
                                        <TableCell>{elePerHour * 24 * 30} ELE</TableCell>
                                        <TableCell>
                                            {toFixedNoTralingZeroes(
                                                calculatePrice(eleUsdcPrice, elePerHour * 24 * 30),
                                                2
                                            )}{' '}
                                            USDC
                                        </TableCell>
                                        <TableCell>{calculatePrice(eleSolPrice, elePerHour * 24 * 30)} SOL</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </main>
            </div>
        </>
    );
}
