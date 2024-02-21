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

export default function Home() {
    const wallets = useAssetStore((state) => state.wallets);
    const addWallet = useAssetStore((state) => state.addWallet);
    const assetsLoadingState = useAssetStore((state) => state.loadingState);

    const [rabbitsElePerHour, setRabbitsElePerHour] = useState<number>(0);
    const [crystalsElePerHour, setCrystalsElePerHour] = useState<number>(0);
    const [otherNFTsElePerHour, setOtherNFTsElePerHour] = useState<number>(0);

    const eleSolPrice = useEleSolPriceStore((state) => state.price);
    const refreshEleSolPrice = useEleSolPriceStore((state) => state.fetch);
    const eleUsdcPrice = useEleUsdcPriceStore((state) => state.price);
    const refreshEleUsdcPrice = useEleUsdcPriceStore((state) => state.fetch);

    const [timeframe, setTimeframe] = useState<number>(1);

    useEffect(() => {
        setRabbitsElePerHour(_.sum(Object.values(wallets).map((w) => w.rabbitsElePerHour)));
        setCrystalsElePerHour(_.sum(Object.values(wallets).map((w) => w.crystalsElePerHour)));
        setOtherNFTsElePerHour(_.sum(Object.values(wallets).map((w) => w.otherNFTsElePerHour)));
    }, [wallets]);

    useEffect(() => {
        refreshEleSolPrice();
        refreshEleUsdcPrice();
    }, [refreshEleSolPrice, refreshEleUsdcPrice]);

    async function handleWalletAddressInput(address: string) {
        if (!_.isNil(address) && !_.isEmpty(address)) {
            await addWallet(address);
        }
    }

    function handleTimeframeChange(event: SelectChangeEvent<number>) {
        event.preventDefault();
        setTimeframe(_.toNumber(event.target.value));
    }

    function totalElePerHour() {
        return rabbitsElePerHour + crystalsElePerHour + otherNFTsElePerHour;
    }

    function perTimeFrame(perHour: number) {
        return _.round(timeframe * perHour, 8);
    }

    function eleInSol(ele: number) {
        return ele * eleSolPrice;
    }

    function eleInUsdc(ele: number) {
        return ele * eleUsdcPrice;
    }

    return (
        <>
            <Head>
                <title>Elementerra tools</title>
                <meta name="description" content="Tools for Elementerra.io players, created by @nedrise." />
            </Head>

            <div className={styles.Container}>
                <main className={styles.Main}>
                    <Box className={styles.Inputs}>
                        <WalletInput />

                        <FormControl sx={{ minWidth: '300px' }}>
                            <InputLabel id="eleProductionTimeframeLabel">Timeframe</InputLabel>

                            <Select
                                labelId="eleProductionTimeframeLabel"
                                aria-label="Timeframe"
                                id="eleProductionTimeframe"
                                value={timeframe}
                                label="Timeframe"
                                onChange={handleTimeframeChange}
                            >
                                <MenuItem value={1} selected>
                                    One Hour
                                </MenuItem>
                                <MenuItem value={24}>One Day</MenuItem>
                                <MenuItem value={168}>7 Days</MenuItem>
                                <MenuItem value={720}>30 Days</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {assetsLoadingState === 'initial' || assetsLoadingState === 'loaded' ? (
                        <>
                            <TableContainer component={Paper}>
                                <Table size='small' aria-label="ELE production table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Summary</TableCell>
                                            <TableCell>ELE/{timeframe}h</TableCell>
                                            <TableCell>SOL/{timeframe}h</TableCell>
                                            <TableCell>USDC/{timeframe}h</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Rabbits</TableCell>
                                            <TableCell>{perTimeFrame(rabbitsElePerHour)} ELE</TableCell>
                                            <TableCell>{perTimeFrame(eleInSol(rabbitsElePerHour))} SOL</TableCell>
                                            <TableCell>{perTimeFrame(eleInUsdc(rabbitsElePerHour))} USDC</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Crystals</TableCell>
                                            <TableCell>{perTimeFrame(crystalsElePerHour)} ELE</TableCell>
                                            <TableCell>{perTimeFrame(eleInSol(crystalsElePerHour))} SOL</TableCell>
                                            <TableCell>{perTimeFrame(eleInUsdc(crystalsElePerHour))} USDC</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Other NFTs</TableCell>
                                            <TableCell>{perTimeFrame(otherNFTsElePerHour)} ELE</TableCell>
                                            <TableCell>{perTimeFrame(eleInSol(otherNFTsElePerHour))} SOL</TableCell>
                                            <TableCell>{perTimeFrame(eleInUsdc(otherNFTsElePerHour))} USDC</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell variant="head">All</TableCell>
                                            <TableCell variant="head">{perTimeFrame(totalElePerHour())} ELE</TableCell>
                                            <TableCell variant="head">
                                                {perTimeFrame(eleInSol(totalElePerHour()))} SOL
                                            </TableCell>
                                            <TableCell variant="head">
                                                {perTimeFrame(eleInUsdc(totalElePerHour()))} USDC
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <br />

                            <RabbitsTable
                                rabbits={Object.values(wallets).flatMap((w) => w.rabbits)}
                                eleSolPrice={eleSolPrice}
                            />

                            <br />

                            <CrystalsTable
                                crystals={Object.values(wallets).flatMap((w) => w.crystals)}
                                eleSolPrice={eleSolPrice}
                            />

                            <br />

                            <OtherNftsTable
                                otherNfts={Object.values(wallets).flatMap((w) => w.otherNFTs)}
                                eleSolPrice={eleSolPrice}
                            />
                        </>
                    ) : (
                        <>
                            <h3>Loading ...</h3>
                        </>
                    )}
                    <br />
                </main>
            </div>
        </>
    );
}

// export default Home;
