import { useEffect, useState } from 'react';
import { useAssetStore } from '../app/stores/assets';
import { Element, PADDING_ADDRESS, useElementsInfoStore } from '../app/stores/shopElements';
import { useConnection } from '@solana/wallet-adapter-react';
import _, { divide } from 'lodash';
import Button from '@mui/material/Button';
import { Header } from '../app/components/Header';
import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    FormControlLabel,
    Box,
    Checkbox,
    FormControl,
    FormGroup,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { useChestPricesStore } from '../app/stores/prices';
import { normalize } from '../lib/utils';

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
    chestTier: string;
    weight: number;
};

const defaultChestsWeights: ChestWeight[] = [
    { chestTier: '1', weight: 1 },
    { chestTier: '2', weight: 2 },
    { chestTier: '3', weight: 3 },
    { chestTier: '4', weight: 4 },
    { chestTier: '5', weight: 5 },
    { chestTier: '6', weight: 6 },
    { chestTier: '7', weight: 7 },
];

export default function CasingChests() {
    const { connection } = useConnection();

    const wallets = useAssetStore((state) => state.wallets);
    const walletLoadinState = useAssetStore((state) => state.loadingState);

    const elements = useElementsInfoStore((state) => state.elements);
    const elementsRecord = useElementsInfoStore((state) => state.elementsRecord);
    const fetchElements = useElementsInfoStore((state) => state.fetch);

    const chestPrices = useChestPricesStore((state) => state.prices);
    const fetchChestPrices = useChestPricesStore((state) => state.fetch);

    const [elementsStats, setElementsStats] = useState<ElementsStats[]>([]);

    const [chestsWeights, setChestsWeights] = useState(defaultChestsWeights);

    const [orderByCostEffectiveness, setOrderByCostEffectiveness] = useState<Order>('none');

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (elements.length > 0) {
            setLoaded(true);

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

            stats.forEach(
                (stat) =>
                    (stat.costEffectiveness = normalize(
                        stat.costEffectiveness,
                        maxCostEffectiveness!,
                        minCostEffectiveness!
                    ))
            );

            setElementsStats(stats);
        }
    }, [elements, chestsWeights]);

    useEffect(() => {
        if (orderByCostEffectiveness !== 'none') {
            setElementsStats(_.orderBy(elementsStats, ['costEffectiveness'], [orderByCostEffectiveness]));
        }
    }, [orderByCostEffectiveness]);

    useEffect(() => {
        fetchElements(connection);
        fetchChestPrices();
    }, [connection]);

    function getReturnValue(chests: Record<number, number>): number {
        return _.sum(
            Object.entries(chests).map(([tier, count]) => {
                const weight = chestsWeights.find((cw) => cw.chestTier === tier)?.weight || 0;
                return weight * count;
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

    function getAvailableElements() {
        const availableElements: Record<string, number> = {};

        for (const e of Object.values(wallets).flatMap((w) => w.elements.map((e) => e.content?.metadata.name))) {
            const elementName = e!;

            if (!_.has(availableElements, elementName)) {
                availableElements[elementName] = 1;
            } else {
                availableElements[elementName] += 1;
            }
        }

        return availableElements;
    }

    function craftElement(recipe: string[], availableElements: Record<string, number>) {
        const recipeNames = recipe.map((e) => elementsRecord[e].name);

        const available = _.clone(availableElements);
        let used = 0;

        for (const elementName of recipeNames) {
            if (_.has(available, elementName)) {
                available[elementName] -= 1;
                used++;
            }
        }

        if (used === 4) {
            console.log('Craftet');
        } else {
            for (const element of recipe) {
                if (element !== PADDING_ADDRESS) {
                    const innerRecipe = elementsRecord[element].recipe;
                    craftElement(innerRecipe, availableElements);
                }
            }
        }
    }

    function handleChestWeightChange(chestWeight: ChestWeight, value: string) {
        resetOrders();

        const newWeights = [];
        for (const c of chestsWeights) {
            if (c.chestTier !== chestWeight.chestTier) {
                newWeights.push(c);
            } else {
                newWeights.push({ chestTier: chestWeight.chestTier, weight: parseInt(value, 10) });
            }
        }
        setChestsWeights(newWeights);
    }

    function handleChestWeightDefault() {
        resetOrders();
        setChestsWeights(defaultChestsWeights);
    }

    async function handleChestWeightPrice() {
        setLoaded(false);
        resetOrders();

        const newChestsWeights = [];
        for (const [chestTier, weight] of Object.entries(chestPrices)) {
            newChestsWeights.push({ chestTier, weight: weight || 0 });
        }
        if (!_.isEmpty(newChestsWeights)) {
            setChestsWeights(newChestsWeights);
        }

        setLoaded(true);
    }

    function handleToggleOrderByCostEffectiveness() {
        if (orderByCostEffectiveness === 'none') {
            setOrderByCostEffectiveness('desc');
        } else if (orderByCostEffectiveness === 'desc') {
            setOrderByCostEffectiveness('asc');
        } else {
            setOrderByCostEffectiveness('none');
        }
    }

    function resetOrders() {
        setOrderByCostEffectiveness('none');
    }

    return (
        <>
            <Header />

            <h2>Chasing Chests (WIP)</h2>

            <Box sx={{ padding: '1rem 4rem', gap: '1rem', display: 'flex', alignItems: 'center' }}>
                <Typography component={'h5'}>Chests Values: </Typography>

                {_.orderBy(chestsWeights, ['chestTier', 'asc']).map((chestWeight) => (
                    <FormControl key={chestWeight.chestTier}>
                        <TextField
                            placeholder={'Tier: ' + chestWeight.chestTier}
                            label={'Tier: ' + chestWeight.chestTier}
                            sx={{ maxWidth: 100 }}
                            type="number"
                            value={chestWeight.weight}
                            onChange={(event) => handleChestWeightChange(chestWeight, event.target.value)}
                        />
                    </FormControl>
                ))}

                <Button variant="outlined" onClick={handleChestWeightDefault}>
                    Default Chest Values
                </Button>

                <Button variant="outlined" onClick={async () => await handleChestWeightPrice()}>
                    Chest Values by floor price
                </Button>
            </Box>

            <br />

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <p>
                    <strong style={{ color: 'orange' }}>Profitability Points</strong> are calculated by{' '}
                    <strong style={{ color: 'orange' }}>Value / Cost</strong> and then normalized
                </p>
            </div>

            <br />

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 600 }} aria-label="ELE production table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Element</TableCell>
                            <TableCell>Chests</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>
                                <Button
                                    variant="text"
                                    color={orderByCostEffectiveness === 'none' ? 'primary' : 'success'}
                                    onClick={handleToggleOrderByCostEffectiveness}
                                >
                                    {viewOrderByArrow('Profitability Points', orderByCostEffectiveness)}
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {elementsStats.map((stats) => (
                            <ViewElementsStatsRow key={stats.elementName} stats={stats} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

type ViewElementsStatsRowProps = {
    stats: ElementsStats;
};

function ViewElementsStatsRow(props: ViewElementsStatsRowProps) {
    return (
        <TableRow>
            <TableCell>{props.stats.elementName}</TableCell>
            <TableCell>{viewChests(props.stats.chests)}</TableCell>
            <TableCell>{props.stats.returnValue}</TableCell>
            <TableCell>{props.stats.cost}</TableCell>
            <TableCell>{(props.stats.costEffectiveness * 100).toFixed(0)}</TableCell>
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

function viewOrderByArrow(label: string, order: Order) {
    if (order === 'desc') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {label} <ArrowDownward sx={{ width: '1rem', height: '1rem' }} />
            </div>
        );
    } else if (order === 'asc') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {label} <ArrowUpward sx={{ width: '1rem', height: '1rem' }} />
            </div>
        );
    } else {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {label} <div style={{ width: '1rem', height: '1rem' }}></div>
            </div>
        );
    }
}
