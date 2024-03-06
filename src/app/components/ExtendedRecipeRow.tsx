import { Divider, Paper } from '@mui/material';
import _ from 'lodash';
import { ExtendedRecipe } from '../../pages/elements';
import { Element } from '../stores/shopElements';
import { DAS } from 'helius-sdk';
import { LoadingState } from '../../lib/utils';
import { useEffect, useState } from 'react';

type Props = {
    index: number;
    element?: Element;
    extendedRecipe: ExtendedRecipe;
    multiplier: number;
    walletElements: DAS.GetAssetResponse[];
    walletLoadingState: LoadingState;
};

export function ExtendedRecipeRow(props: Props) {
    const [recipeTier, setRecipeTier] = useState<number>(0);

    const [youHave, setYouHave] = useState<ExtendedRecipe>({});
    const [youNeed, setYouNeed] = useState<ExtendedRecipe>({});
    const [youNeedEle, setYouNeedEle] = useState<number>(0);

    useEffect(() => {
        const el = props.element;
        if (!_.isNil(el)) {
            setRecipeTier(el.tier - 1 - props.index);
        }
    }, [props.element]);

    useEffect(() => {
        if (!_.isNil(props.walletElements) && !_.isEmpty(props.walletElements)) {
            const relevantElementsInWallet: ExtendedRecipe = {};
            const missingElementsFromRecipe: ExtendedRecipe = _.cloneDeep(props.extendedRecipe);

            for (const el of Object.values(missingElementsFromRecipe)) {
                el.amount *= props.multiplier;
            }

            for (const el of props.walletElements) {
                const name = el.content?.metadata?.name || '';

                if (_.has(props.extendedRecipe, name)) {
                    if (_.has(relevantElementsInWallet, name)) {
                        relevantElementsInWallet[name].amount += 1;
                    } else {
                        let extended = _.clone(props.extendedRecipe[name]);
                        extended.amount = 1;
                        relevantElementsInWallet[name] = extended;
                    }

                    if (_.has(missingElementsFromRecipe, name)) {
                        missingElementsFromRecipe[name].amount -= 1;
                        if (missingElementsFromRecipe[name].amount <= 0) {
                            delete missingElementsFromRecipe[name];
                        }
                    }
                }
            }
            let requiredEleForPurchase = 0;

            for (const { element, amount } of Object.values(missingElementsFromRecipe)) {
                if (!_.isNil(element.price)) {
                    requiredEleForPurchase += element.price * amount;
                }
            }

            setYouHave(relevantElementsInWallet);
            setYouNeed(missingElementsFromRecipe);
            setYouNeedEle(requiredEleForPurchase);
        }
    }, [props.walletElements, props.multiplier]);

    return (
        <>
            <div key={props.index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <div
                    style={{
                        width: '100%',
                        margin: '0.5rem 0',
                    }}
                >
                    {viewExtendedRecipeRow(props.extendedRecipe, props.multiplier, recipeTier)}
                </div>
                <p style={{ whiteSpace: 'nowrap' }}>{`<= T${recipeTier}`}</p>
            </div>
            {props.walletLoadingState === 'loading' ? (
                <>Loading ...</>
            ) : props.walletLoadingState === 'loaded' ? (
                _.isEmpty(props.walletElements) ? (
                    <>No elements in wallet</>
                ) : (
                    viewWalletCalculation(youHave, youNeed, youNeedEle, recipeTier)
                )
            ) : (
                <></>
            )}{' '}
            <Divider sx={{ margin: '1rem 0' }} />
        </>
    );
}

function viewExtendedRecipeRow(extendedRecipe: ExtendedRecipe, multiplier: number, recipeTier: number) {
    return (
        <Paper
            sx={{
                margin: '0.5rem 0',
                padding: '0.5rem 1rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'start',
                flexWrap: 'wrap',
            }}
        >
            {_.orderBy(Object.values(extendedRecipe), ['element.tier', 'element.name'], ['asc', 'asc']).map(
                ({ element, amount }) => viewExtendedRecipeItem(element, amount * multiplier, recipeTier)
            )}
        </Paper>
    );
}

function viewWalletCalculation(
    youHave: ExtendedRecipe,
    youNeed: ExtendedRecipe,
    youNeedEle: number,
    recipeTier: number
) {
    return (
        <>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ whiteSpace: 'nowrap' }}>You have: </span>
                <Paper
                    sx={{
                        width: '100%',
                        margin: '0.5rem 0',
                        padding: '0 1rem',
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'start',
                        flexWrap: 'wrap',
                    }}
                >
                    {_.orderBy(Object.values(youHave), ['element.tier', 'element.name'], ['asc', 'asc']).map(
                        ({ element, amount }) => viewExtendedRecipeItem(element, amount, recipeTier)
                    )}
                </Paper>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ whiteSpace: 'nowrap' }}>You need: </span>
                <Paper
                    sx={{
                        width: '100%',
                        margin: '0.5rem 0',
                        padding: '0 1rem',
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'start',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {_.orderBy(Object.values(youNeed), ['element.tier', 'element.name'], ['asc', 'asc']).map(
                        ({ element, amount }) => viewExtendedRecipeItem(element, amount, recipeTier)
                    )}
                </Paper>
                <span style={{ whiteSpace: 'nowrap' }}>= {youNeedEle} ELE</span>
            </div>
        </>
    );
}

function viewExtendedRecipeItem(element: Element, amount: number, recipeTier: number) {
    if (recipeTier === element.tier) {
        return (
            <p key={element.address} style={{ whiteSpace: 'nowrap', fontWeight: 'normal' }}>
                {amount} {element.name}
            </p>
        );
    }

    return (
        <p key={element.address} style={{ whiteSpace: 'nowrap', fontWeight: 200 }}>
            {amount} {element.name}
        </p>
    );
}
