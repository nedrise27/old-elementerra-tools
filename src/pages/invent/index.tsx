import { Button } from '@mui/base';
import { Delete } from '@mui/icons-material';
import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { useConnection } from '@solana/wallet-adapter-react';
import _ from 'lodash';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Element, useElementsInfoStore } from '../../app/stores/shopElements';
import styles from '../../styles/Invent.module.css';
import { ElementCardSmall } from '../../app/components/ElementCardSmall';

export type ElementToGuess = {
    element: Element;
    minAmount: number;
    maxAmount: number;
};

export default function InventPage() {
    const { connection } = useConnection();

    const elements = useElementsInfoStore((state) => state.elements);
    const refetchElements = useElementsInfoStore((state) => state.fetch);

    const [notInventedElements, setNotInventedElements] = useState<Element[]>([]);
    const [inventedElements, setInventedElements] = useState<Element[]>([]);

    const [elementToInvent, setElementToInvent] = useState<Element>();
    const [elementsToPick, setElementsToPick] = useState<Element[]>([]);
    const [elementsToGuess, setElementsToGuess] = useState<ElementToGuess[]>([]);

    const [suggestionsLoading, setSuggestionsLoading] = useState<'none' | 'loading' | 'loaded'>('none');
    const [recipesToTry, setRecipesToTry] = useState<Element[][]>();
    const [recipesToTryAmount, setRecipesToTryAmount] = useState<number>();
    const [alreadyTriedRecipes, setAlreadyTriedRecipes] = useState<Element[][]>();

    const [warning, setWarning] = useState<string>('');

    useEffect(() => {
        if (!_.isNil(elements) && !_.isEmpty(elements)) {
            let els = _.orderBy(elements, ['tier', 'name'], ['asc', 'asc']);
            const invented = _.filter(els, { invented: true });
            const notInvented = _.filter(els, { invented: false });

            setInventedElements(invented);
            setNotInventedElements(notInvented);
        }
    }, [elements]);

    useEffect(() => {
        refetchElements(connection);
    }, [refetchElements]);

    useEffect(() => {
        if (!_.isNil(elementToInvent)) {
            let lower = _.orderBy(inventedElements, ['tier', 'name'], ['asc', 'asc']);
            lower = lower.filter((e) => e.tier < elementToInvent.tier);
            setElementsToPick(lower);
        } else {
            setElementsToPick([]);
        }
    }, [elementToInvent, inventedElements, elementToInvent?.tier]);

    useEffect(() => {
        const tier = elementToInvent?.tier;
        if (!_.isNil(tier)) {
            const requiredTier = tier - 1;
            const highestSelectedTier = _.max(elementsToGuess.map((e) => e.element.tier)) || 0;
            if (highestSelectedTier < requiredTier) {
                setWarning(`Please select at least one tier ${requiredTier} element`);
            } else {
                setWarning('');
            }
        }
    }, [elementsToGuess, elementToInvent?.tier]);

    function resetSelection() {
        setElementToInvent(undefined);
        setElementsToGuess([]);
        setRecipesToTry([]);
        setRecipesToTryAmount(0);
        setAlreadyTriedRecipes([]);
        setWarning('');
    }

    function handleSelectElementToInvent(elementId: string | null) {
        const selected = notInventedElements.find((e) => e.address === elementId);
        if (!_.isNil(selected)) {
            setElementToInvent(selected);
        } else {
            resetSelection();
        }
    }

    function handleAddElementToGuess(elementId: string) {
        const selected = elementsToPick.find((e) => e.address === elementId);
        if (!_.isNil(selected) && _.isNil(elementsToGuess.find((e) => e.element.address === elementId))) {
            setElementsToGuess([...elementsToGuess, { element: selected, minAmount: 0, maxAmount: 4 }]);
        }
    }

    function handleRemoveElementFromGuess(elementId: string) {
        const filtered = elementsToGuess.filter((e) => e.element.address !== elementId);
        setElementsToGuess(filtered);
    }

    function handleSetMinAmount(elementId: string, minAmount: number) {
        const next = [];
        for (const e of elementsToGuess) {
            if (e.element.address === elementId) {
                next.push({ element: e.element, minAmount, maxAmount: e.maxAmount });
            } else {
                next.push(e);
            }
        }
        setElementsToGuess(next);
    }

    function handleSetMaxAmount(elementId: string, maxAmount: number) {
        const next = [];
        for (const e of elementsToGuess) {
            if (e.element.address === elementId) {
                next.push({ element: e.element, minAmount: e.minAmount, maxAmount });
            } else {
                next.push(e);
            }
        }
        setElementsToGuess(next);
    }

    async function handleRequestSuggetions() {
        setSuggestionsLoading('loading');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes/get-available-recipes`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    tier: elementToInvent?.tier,
                    elements: elementsToGuess.map((e) => ({
                        element: e.element.name.replaceAll(' ', '').toLowerCase(),
                        minAmount: e.minAmount,
                        maxAmount: e.maxAmount,
                    })),
                }),
            });
            const body = await res.json();

            const possibilities = body.possibilities.map((p: string[]) =>
                p.map((el) => elements.find((e) => e.name.replaceAll(' ', '').toLowerCase() === el))
            );
            const alreadyTried = body.alreadyTried.map((p: string[]) =>
                p.map((el) => elements.find((e) => e.name.replaceAll(' ', '').toLowerCase() === el))
            );

            setRecipesToTry(possibilities);
            setRecipesToTryAmount(body.numberOfPossibilies);
            setAlreadyTriedRecipes(alreadyTried);
        } catch (err) {
            console.error(err);
            setWarning('There was an error while creating the combinations. Please try with less elements.');
        }

        setSuggestionsLoading('loaded');
    }

    function handleRemoveRecipeToTry(index: number) {
        const newRecipesToTry = _.cloneDeep(recipesToTry);
        newRecipesToTry?.splice(index, 1);
        setRecipesToTry(newRecipesToTry);
    }

    return (
        <>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <h3 style={{ color: 'orange' }}>
                    There is still the possibility that we do not have every tried attempt. All attempts that are shown
                    as already tried are consistent though.
                </h3>
            </div>

            {_.isNil(elementToInvent) ? (
                <Box sx={{ flexGrow: 1 }}>
                    <div style={{ width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <h4>Select Element you want to invent:</h4>
                    </div>

                    <Grid container spacing={1} gap={1.5} justifyContent={'center'}>
                        {notInventedElements.map((e) => (
                            <ElementCardSmall key={e.address} element={e} onClick={handleSelectElementToInvent} />
                        ))}
                    </Grid>
                </Box>
            ) : (
                <>
                    <div
                        style={{
                            width: '100%',
                            padding: '0 2rem',
                            marginBottom: '2rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <p>
                                We will invent{' '}
                                <strong>
                                    {elementToInvent.name} T{elementToInvent.tier}
                                </strong>{' '}
                            </p>
                            <Button onClick={() => handleSelectElementToInvent(null)} style={{ maxHeight: '40px' }}>
                                <Delete />
                            </Button>
                        </div>

                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p>Next: select Elements to add to recipe</p>
                        </div>
                    </div>

                    <Grid container spacing={1} gap={1.5} justifyContent={'center'}>
                        {elementsToPick.map((e) => (
                            <ElementCardSmall key={e.address} element={e} onClick={handleAddElementToGuess} />
                        ))}
                    </Grid>

                    <div
                        style={{
                            width: '100%',
                            minHeight: '4rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '2rem',
                        }}
                    >
                        <Typography color={'orange'}>{warning ? warning : ''}</Typography>
                        <Button style={{ minHeight: '3rem' }} onClick={handleRequestSuggetions}>
                            Get suggestions
                        </Button>
                    </div>

                    <TableContainer component={Paper} sx={{ maxWidth: 900, margin: '0 auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Element</TableCell>
                                    <TableCell>Tier</TableCell>
                                    <TableCell>Minimum</TableCell>
                                    <TableCell>Maximum</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {elementsToGuess.map((e) => (
                                    <ElementToGuessTableRow
                                        key={e.element.address}
                                        element={e}
                                        minAmount={e.minAmount}
                                        maxAmount={e.maxAmount}
                                        onRemove={handleRemoveElementFromGuess}
                                        onSetMinAmount={handleSetMinAmount}
                                        onSetMaxAmount={handleSetMaxAmount}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <br />

                    {suggestionsLoading === 'loading' ? (
                        <div>Loading ...</div>
                    ) : suggestionsLoading === 'loaded' ? (
                        <>
                            <Toolbar component={Paper} sx={{ maxWidth: 900, margin: '0 auto' }}>
                                <Typography>No one tried these recipes yet. Count: {recipesToTryAmount}</Typography>
                            </Toolbar>
                            <TableContainer component={Paper} sx={{ maxWidth: 900, margin: '0 auto' }}>
                                <Table sx={{ maxWidth: 900 }} size="small">
                                    <TableBody>
                                        {recipesToTry?.map((recipe, i) => (
                                            <RecipeRow
                                                key={i}
                                                recipe={recipe}
                                                onRemove={() => handleRemoveRecipeToTry(i)}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <br />

                            <Toolbar sx={{ maxWidth: 900, margin: '0 auto' }} component={Paper}>
                                <Typography>These recipes were already tried</Typography>
                            </Toolbar>
                            <TableContainer component={Paper} sx={{ maxWidth: 900, margin: '0 auto' }}>
                                <Table sx={{ maxWidth: 900 }} size="small">
                                    <TableBody>
                                        {alreadyTriedRecipes?.map((recipe, i) => (
                                            <RecipeRow key={i} recipe={recipe} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    ) : (
                        <></>
                    )}
                </>
            )}

            <div style={{ height: '4rem' }}></div>
        </>
    );
}

type ElementToGuessTableRowProps = {
    element: ElementToGuess;
    minAmount: number;
    maxAmount: number;
    onRemove: (elementId: string) => void;
    onSetMinAmount: (elementId: string, minAmount: number) => void;
    onSetMaxAmount: (elementId: string, maxAmount: number) => void;
};

function ElementToGuessTableRow(props: ElementToGuessTableRowProps) {
    return (
        <TableRow>
            <TableCell>{props.element.element.name}</TableCell>
            <TableCell>{props.element.element.tier}</TableCell>
            <TableCell>
                <TextField
                    type="number"
                    value={props.minAmount}
                    onChange={(event) =>
                        props.onSetMinAmount(props.element.element.address, parseInt(event.target.value, 10))
                    }
                />
            </TableCell>
            <TableCell>
                <TextField
                    type="number"
                    value={props.maxAmount}
                    onChange={(event) =>
                        props.onSetMaxAmount(props.element.element.address, parseInt(event.target.value, 10))
                    }
                />
            </TableCell>
            <TableCell>
                <Button onClick={() => props.onRemove(props.element.element.address)}>
                    <Delete />
                </Button>
            </TableCell>
        </TableRow>
    );
}

type RecipeRowProps = {
    recipe: Element[];
    onRemove?: () => void;
};

function RecipeRow(props: RecipeRowProps) {
    return (
        <TableRow className={styles.RecipeRow}>
            <TableCell>
                <div className={styles.RecipeRowCell}>
                    <span className={styles.RecipeRowName}>{props.recipe[0].name}</span>
                    <Image src={props.recipe[0].url} alt={props.recipe[0].name} width={24} height={24} />
                </div>
            </TableCell>
            <TableCell>
                <div className={styles.RecipeRowCell}>
                    <span className={styles.RecipeRowName}>{props.recipe[1].name}</span>
                    <Image src={props.recipe[1].url} alt={props.recipe[1].name} width={24} height={24} />
                </div>
            </TableCell>
            <TableCell>
                <div className={styles.RecipeRowCell}>
                    <span className={styles.RecipeRowName}>{props.recipe[2].name}</span>
                    <Image src={props.recipe[2].url} alt={props.recipe[2].name} width={24} height={24} />
                </div>
            </TableCell>
            <TableCell>
                <div className={styles.RecipeRowCell}>
                    <span className={styles.RecipeRowName}>{props.recipe[3].name}</span>
                    <Image src={props.recipe[3].url} alt={props.recipe[3].name} width={24} height={24} />
                </div>
            </TableCell>
            <TableCell>{_.sum(props.recipe.map((r) => r.price))} ELE</TableCell>
            <TableCell>
                {!_.isNil(props.onRemove) && (
                    <Button onClick={props.onRemove}>
                        <Delete />
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
}
