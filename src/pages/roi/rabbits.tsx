import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import { Header } from '../../app/components/Header';
import { useEleSolPriceStore, useRabbitPriceStore } from '../../app/stores/prices';
import { RabbitLevelInfo, useRabbitLevelInfoStore } from '../../app/stores/rabbitLevels';
import { useElementsInfoStore } from '../../app/stores/shopElements';
import { calculatePrice } from '../../lib/utils/price';

export default function RoiCrystalsPage() {
    const { connection } = useConnection();

    const [loading, setLoading] = useState(true);

    const eleSolPrice = useEleSolPriceStore((state) => state.price);
    const refreshEleSolPrice = useEleSolPriceStore((state) => state.fetch);

    const rabbitBasePrice = useRabbitPriceStore((state) => state.price);
    const fetchRabbitBasePrice = useRabbitPriceStore((state) => state.fetch);

    const rabbitsLevelInfo = useRabbitLevelInfoStore((state) => state.rabbitLevelInfo);
    const fetchRabbitLevelInfo = useRabbitLevelInfoStore((state) => state.fetch);

    const elements = useElementsInfoStore((state) => state.elements);
    const refetchElements = useElementsInfoStore((state) => state.fetch);

    useEffect(() => {
        if (!_.isEmpty(elements)) {
            fetchRabbitLevelInfo(elements);
        }
    }, [elements, fetchRabbitLevelInfo]);

    useEffect(() => {
        refreshEleSolPrice();
        fetchRabbitBasePrice();
        refetchElements(connection);
        setLoading(false);
    }, [fetchRabbitBasePrice, refetchElements, refreshEleSolPrice]);

    return (
        <>
            {loading ? (
                <h3>Loading ...</h3>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: '75vh', maxWidth: 1200, margin: '1rem auto' }}>
                    <Table stickyHeader aria-label="ELE production table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Rabbit LvL</TableCell>
                                <TableCell>ELE/h</TableCell>
                                <TableCell>SOL/d</TableCell>
                                <TableCell>Element to burn</TableCell>
                                <TableCell>ELE to burn</TableCell>
                                <TableCell>Lvl Cost</TableCell>
                                <TableCell>Lvl Cost SUM</TableCell>
                                <TableCell>FP + Lvl Cost SUM</TableCell>
                                <TableCell>ROI in Days</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rabbitsLevelInfo &&
                                Object.entries(rabbitsLevelInfo).map(([level, info]) => (
                                    <ViewRabbitRoiRow
                                        key={level}
                                        level={level}
                                        info={info}
                                        basePrice={rabbitBasePrice}
                                    />
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
}

type RowProps = {
    level: string;
    info: RabbitLevelInfo;
    basePrice: number | null;
};

function ViewRabbitRoiRow(props: RowProps) {
    const eleSolPrice = useEleSolPriceStore((state) => state.price);

    const [solPerDay, setSolPerDay] = useState(0);
    const [fpAndLvlCostInSol, setFpAndLvlCostInSol] = useState(0);
    const [roi, setRoi] = useState(0);

    useEffect(() => {
        if (!_.isNil(props.basePrice) && !_.isNil(eleSolPrice)) {
            const perDay = calculatePrice(eleSolPrice, props.info.elePerHour * 24);
            setSolPerDay(perDay);

            if (!_.isNil(props.info.totalLevelCost)) {
                const fpAndLvlCost = props.basePrice + calculatePrice(eleSolPrice, props.info.totalLevelCost);

                setFpAndLvlCostInSol(calculatePrice(1, fpAndLvlCost));
                setRoi(calculatePrice(1, fpAndLvlCost / perDay));
            } else {
                setFpAndLvlCostInSol(NaN);
                setRoi(NaN);
            }
        }
    }, [props.basePrice, eleSolPrice, props.info.elePerHour, props.info.totalLevelCost]);

    return (
        <TableRow key={props.level}>
            <TableCell>{props.level}</TableCell>
            <TableCell>{props.info.elePerHour} ELE/h</TableCell>
            <TableCell>{solPerDay} SOL/d</TableCell>
            <TableCell>{props.info.elementToBurn}</TableCell>
            <TableCell>{props.info.eleToBurn} ELE</TableCell>
            <TableCell>{props.info.levelCost ? props.info.levelCost + ' ELE' : 'unkown'}</TableCell>
            <TableCell>{props.info.totalLevelCost ? props.info.totalLevelCost + ' ELE' : 'unkown'}</TableCell>
            <TableCell>{fpAndLvlCostInSol ? fpAndLvlCostInSol + ' SOL' : 'unkown'}</TableCell>
            <TableCell>{roi ? _.round(roi, 2) + ' Days' : 'unkown'}</TableCell>
        </TableRow>
    );
}
