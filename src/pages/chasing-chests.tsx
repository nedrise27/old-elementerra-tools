import {
    Box,
    FormControl,
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
import Button from '@mui/material/Button';
import { useConnection } from '@solana/wallet-adapter-react';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { useChestPricesStore } from '../app/stores/prices';
import { Element, PADDING_ADDRESS, useElementsInfoStore } from '../app/stores/shopElements';
import { CHESTS_AVARAGE_ELE_PER_HOUR } from '../lib/constants/chests';
import { toFixedNoTralingZeroes } from '../lib/utils';

type ElementsStats = {
    elementName: string;
    elementAddress: string;
    returnValue: number;
    cost: number;
    costEffectiveness: number;
    chests: Record<number, number>;
};

type Order = 'none' | 'asc' | 'desc';

type ChestWeight = {
    chestTier: number;
    weight: string;
};

const defaultChestsWeights = CHESTS_AVARAGE_ELE_PER_HOUR.map(({ tier, avarageElePerHour }) => ({
    chestTier: tier,
    weight: avarageElePerHour.toString(),
}));

export default function CasingChests() {
    const { connection } = useConnection();

    const elements = useElementsInfoStore((state) => state.elements);
    const elementsRecord = useElementsInfoStore((state) => state.elementsRecord);
    const fetchElements = useElementsInfoStore((state) => state.fetch);

    const chestPrices = useChestPricesStore((state) => state.prices);
    const fetchChestPrices = useChestPricesStore((state) => state.fetch);

    const [elementsStats, setElementsStats] = useState<ElementsStats[]>([]);

    const [chestsWeights, setChestsWeights] = useState(defaultChestsWeights);

    useEffect(() => {
        if (elements.length > 0) {
            const sortedElements = _.orderBy(
                elements.filter((e) => e.chestsAvailable && e.invented),
                ['tier', 'price'],
                ['asc', 'asc']
            );

            const stats: ElementsStats[] = [];

            let minCostEffectiveness: number | null = null;
            let maxCostEffectiveness: number | null = null;

            for (const e of sortedElements) {
                if (e.chestsAvailable) {
                    const chests: Record<number, number> = {};
                    getChestsCount(e, chests);

                    const cost = e.price!;
                    const returnValue = getReturnValue(chests);
                    const costEffectiveness = getCostEffectiveness(cost, returnValue);

                    if (_.isNil(minCostEffectiveness) || costEffectiveness < minCostEffectiveness) {
                        minCostEffectiveness = costEffectiveness;
                    }
                    if (_.isNil(maxCostEffectiveness) || costEffectiveness > maxCostEffectiveness) {
                        maxCostEffectiveness = costEffectiveness;
                    }

                    stats.push({
                        elementName: e.name,
                        elementAddress: e.address,
                        returnValue,
                        cost,
                        costEffectiveness,
                        chests,
                    });
                }
            }

            setElementsStats(_.orderBy(stats, ['costEffectiveness'], ['desc']));
        }
    }, [elements, chestsWeights]);

    useEffect(() => {
        fetchElements(connection);
        fetchChestPrices();
    }, [connection]);

    function getReturnValue(chests: Record<number, number>): number {
        return _.sum(
            Object.entries(chests).map(([tier, count]) => {
                const weight = chestsWeights.find((cw) => cw.chestTier === parseInt(tier, 10))?.weight!;
                return parseFloat(weight) * count;
            })
        );
    }

    function getCostEffectiveness(cost: number, returnValue: number): number {
        return returnValue / cost;
    }

    function getChestsCount(element: Element, chests: Record<number, number>) {
        if (!element.chestsAvailable) {
            return;
        }
        if (_.has(chests, element.tier)) {
            chests[element.tier] += 1;
        } else {
            chests[element.tier] = 1;
        }
        for (const innerElementAddress of element.recipe) {
            if (innerElementAddress !== PADDING_ADDRESS) {
                const e = elementsRecord[innerElementAddress];
                getChestsCount(e, chests);
            }
        }
    }

    function handleChestWeightChange(chestWeight: ChestWeight, value: string) {
        const newWeights: ChestWeight[] = [];
        for (const c of chestsWeights) {
            if (c.chestTier !== chestWeight.chestTier) {
                newWeights.push(c);
            } else {
                newWeights.push({ chestTier: chestWeight.chestTier, weight: value });
            }
        }

        setChestsWeights(newWeights);
    }

    function handleChestWeightElePerHour() {
        setChestsWeights(defaultChestsWeights);
    }

    async function handleChestWeightPrice() {
        const newChestsWeights: ChestWeight[] = [];
        for (const [chestTier, weight] of Object.entries(chestPrices)) {
            newChestsWeights.push({ chestTier: parseInt(chestTier, 10), weight: weight ? weight.toString() : '0' });
        }
        if (!_.isEmpty(newChestsWeights)) {
            setChestsWeights(newChestsWeights);
        }
    }

    return (
        <>
            <Box sx={{ maxWidth: 900, margin: '1rem auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h2>Chasing Chests (WIP)</h2>

                <Typography component={'h5'}>Chests Values: </Typography>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {_.orderBy(chestsWeights, ['chestTier', 'asc']).map((chestWeight) => (
                        <FormControl key={chestWeight.chestTier}>
                            <TextField
                                placeholder={'Tier: ' + chestWeight.chestTier}
                                label={'Tier: ' + chestWeight.chestTier}
                                sx={{ maxWidth: 100 }}
                                type="text"
                                value={chestWeight.weight}
                                onChange={(event) => handleChestWeightChange(chestWeight, event.target.value)}
                            />
                        </FormControl>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Typography component={'h5'}>Preset Chest Values: </Typography>

                    <Button variant="outlined" onClick={handleChestWeightElePerHour}>
                        By Average ELE/h
                    </Button>

                    <Button variant="outlined" onClick={async () => await handleChestWeightPrice()}>
                        By Floor Price
                    </Button>
                </div>
            </Box>

            <TableContainer component={Paper} sx={{ maxWidth: 900, maxHeight: '75vh', margin: '1rem auto' }}>
                <Table stickyHeader aria-label="ELE production table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Element</TableCell>
                            <TableCell>Chests</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>Value / Cost</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {elementsStats.map((stats, index) => (
                            <ViewElementsStatsRow key={stats.elementName} rank={index + 1} stats={stats} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

type ViewElementsStatsRowProps = {
    rank: number;
    stats: ElementsStats;
};

function ViewElementsStatsRow(props: ViewElementsStatsRowProps) {
    return (
        <TableRow>
            <TableCell>{props.stats.elementName}</TableCell>
            <TableCell>{viewChests(props.stats.chests)}</TableCell>
            <TableCell>{toFixedNoTralingZeroes(props.stats.returnValue, 8)}</TableCell>
            <TableCell>{props.stats.cost.toFixed(0)}</TableCell>
            <TableCell>{toFixedNoTralingZeroes(props.stats.costEffectiveness, 8)}</TableCell>
        </TableRow>
    );
}

function viewChests(chests: Record<string, number>) {
    const view = [];
    for (const [tier, count] of Object.entries(chests)) {
        view.push(
            <div>
                <span>
                    {count} x T{tier}
                </span>
            </div>
        );
    }

    return view;
}
