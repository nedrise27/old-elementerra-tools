import { useConnection } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { Element, useElementsInfoStore } from '../../app/stores/shopElements';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Box, Divider, InputLabel, Paper, TextField, Typography } from '@mui/material';
import { amount } from '@metaplex-foundation/js';
import { calculatePrice, getExtendedRecipe } from '../../lib/utils';
import Image from 'next/image';
import { ExtendedRecipe } from '.';
import { useEleSolPriceStore, useEleUsdcPriceStore } from '../../app/stores/prices';
import styles from '../../styles/Elements.module.css';
import { DAS } from 'helius-sdk';
import { useAssetStore } from '../../app/stores/assets';
import { WalletInput } from '../../app/components/WalletInput';
import { ExtendedRecipeRow } from '../../app/components/ExtendedRecipeRow';

export default function Page() {
    const router = useRouter();
    const { connection } = useConnection();

    const eleSolPrice = useEleSolPriceStore((state) => state.price);
    const refreshEleSolPrice = useEleSolPriceStore((state) => state.fetch);
    const eleUsdcPrice = useEleUsdcPriceStore((state) => state.price);
    const refreshEleUsdcPrice = useEleUsdcPriceStore((state) => state.fetch);

    const wallets = useAssetStore((state) => state.wallets);
    const assetsLoadingState = useAssetStore((state) => state.loadingState);

    const [elements, setElements] = useState<DAS.GetAssetResponse[]>([]);

    useEffect(() => {
        let els: DAS.GetAssetResponse[] = [];
        for (const assets of Object.values(wallets)) {
            els = [...els, ...assets.elements];
        }
        setElements(els);
    }, [wallets]);

    const [element, setElement] = useState<Element>();
    const elementsRecord = useElementsInfoStore((state) => state.elementsRecord);
    const refetchElements = useElementsInfoStore((state) => state.fetch);
    const [extendedRecipe, setExtendedRecipe] = useState<ExtendedRecipe[]>([]);

    const [amount, setAmount] = useState(1);

    function handleAmountChange(value: string) {
        const a = parseInt(value, 10);
        if (_.isInteger(a) && !_.isNaN(a) && a > 0) {
            setAmount(a);
        } else {
            setAmount(1);
        }
    }

    useEffect(() => {
        refreshEleSolPrice();
        refreshEleUsdcPrice();
        refetchElements(connection);
    }, [refetchElements]);

    useEffect(() => {
        const elementId = router.query.elementId;
        if (!_.isNil(elementId) && _.isString(elementId)) {
            const el = elementsRecord[elementId];
            if (!_.isNil(el)) {
                setElement(el);
                setExtendedRecipe(getExtendedRecipe(el, elementsRecord));
            }
        }
    }, [elementsRecord]);

    return (
        <>
            <Box
                sx={{
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
                        height: '100%',
                        padding: '.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                {element?.name} <small>- T{element?.tier}</small>
                            </Typography>

                            <p>{element?.invented ? 'invented' : 'not invented'}</p>
                            {viewChestsCount(element)}
                        </div>
                        <Image
                            className={element?.invented ? '' : styles.Uninvented}
                            src={element?.url || '#'}
                            width={80}
                            height={80}
                            alt={`picture of ${element?.name}`}
                        />
                    </div>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <InputLabel>Amount: </InputLabel>
                            <TextField
                                sx={{ maxWidth: '6rem' }}
                                type="number"
                                value={amount}
                                onChange={(event) => handleAmountChange(event.target.value)}
                            />
                        </div>

                        <div className={styles.PriceContainer}>
                            <p className={styles.Price}>
                                {element?.price ? `${element?.price * amount} ELE` : 'unkown'}
                            </p>
                            <p className={styles.Price}>
                                {element?.price
                                    ? `${calculatePrice(eleSolPrice, element?.price * amount)} SOL`
                                    : 'unkown'}
                            </p>
                            <p className={styles.Price}>
                                {element?.price
                                    ? `${calculatePrice(eleUsdcPrice, element?.price * amount)} USDC`
                                    : 'unkown'}
                            </p>
                        </div>
                    </div>
                </div>

                <WalletInput />

                <br />
                <p>Recipe and Breakdown:</p>
                <Divider sx={{ margin: '1rem 0' }} />

                <div>
                    {extendedRecipe?.map((recipe, index) => (
                        <ExtendedRecipeRow
                            key={index}
                            index={index}
                            element={element}
                            extendedRecipe={recipe}
                            multiplier={amount}
                            walletElements={elements}
                            walletLoadingState={assetsLoadingState}
                        />
                    ))}
                </div>
            </Box>

            <Box
                sx={{
                    maxWidth: '1080px',
                    margin: '1rem auto',
                }}
            ></Box>
        </>
    );
}

function viewChestsCount(element?: void | Element | undefined) {
    if (element?.chestsAvailable) {
        const total = element.forgedCount + element.remaningCount;
        return (
            <div>
                {element.forgedCount}/{total}
            </div>
        );
    }
}
