import { PublicKey } from '@metaplex-foundation/js';
import {
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ComputeBudgetProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Element, useElementsInfoStore } from '../../app/stores/shopElements';
import { buildBuyElementIx } from '../../lib/buyElementsIx';
import { FEES } from '../../lib/constants/elements';
import { asyncSleep } from '../../lib/utils';
import { COMPUTE_UNIT_LIMIT, TRANSACTION_FEE, levelUpWhitelist } from '../leveling';

export const ELEMENTS_TO_BUY_CHUNK = 4;

type ElementToBuy = {
    element: Element;
    amount: number;
};

export default function BuyElementsPage() {
    const { connection } = useConnection();

    const { publicKey, sendTransaction, connecting, connected, disconnecting } = useWallet();

    const elements = useElementsInfoStore((state) => state.elements);
    const refetchElements = useElementsInfoStore((state) => state.fetch);

    const [elementsToBuy, setElementsToBuy] = useState<ElementToBuy[]>([]);

    const [state, setState] = useState('');

    const [locked, setLocked] = useState(true);

    useEffect(() => {
        refetchElements(connection);
    }, [connection]);

    useEffect(() => {
        setElementsToBuy(getAllElements());
    }, [elements]);

    useEffect(() => {
        setLocked(true);
        if (publicKey) {
            if (levelUpWhitelist.includes(publicKey.toString())) {
                setLocked(false);
            }
        }
    }, [publicKey, connected, connecting, disconnecting]);

    function getAllElements() {
        return _.orderBy(
            elements.filter((e) => e.tier < 7),
            ['tier'],
            ['asc']
        ).map((e) => ({ element: e, amount: 0 }));
    }

    async function buyElements() {
        const _elementsToBuy = [];
        for (const { element, amount } of elementsToBuy) {
            if (amount > 0) {
                for (let i = 0; i < amount; i++) {
                    _elementsToBuy.push(element);
                }
            }
        }

        for (const chunk of _.chunk(_elementsToBuy, ELEMENTS_TO_BUY_CHUNK)) {
            await buyMultipleElements(chunk);
        }

        setState('');
    }

    async function buyMultipleElements(elements: Element[]) {
        setState('Building transaction');

        const ixs = [
            ComputeBudgetProgram.setComputeUnitLimit({
                units: COMPUTE_UNIT_LIMIT,
            }),
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: TRANSACTION_FEE,
            }),
        ];
        for (const element of elements) {
            const ix = buildBuyElementIx(publicKey!, element.name.replaceAll(' ', ''), new PublicKey(element.address));
            ixs.push(ix);
        }

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const messageV0 = new TransactionMessage({
            payerKey: publicKey!,
            recentBlockhash: blockhash,
            instructions: ixs,
        }).compileToV0Message();

        const tx = new VersionedTransaction(messageV0);

        try {
            setState(`Waiting for wallet ... ${elements.map((e) => e.name)}`);
            const signature = await sendTransaction(tx, connection, { minContextSlot });
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            setState(`Successfully bought ${elements.map((e) => e.name)}`);
        } catch (err) {
            setState(`Retry buying ${elements.map((e) => e.name)}. Error: ${err}`);
            await asyncSleep(4000);
            await buyMultipleElements(elements);
        }
    }

    function handleAmountInput(elementAddress: string, amount: number) {
        const copy = _.cloneDeep(elementsToBuy);
        const index = copy.findIndex((e) => e.element.address === elementAddress);
        copy[index].amount = amount;
        setElementsToBuy(copy);
    }

    function handleAllAmountsInput(amount: number) {
        setElementsToBuy(elementsToBuy.map((e) => ({ element: e.element, amount })));
    }

    return (
        <Container maxWidth="lg" sx={{ padding: '1rem', boxSizing: 'border-box' }}>
            <h1>Buy Elements </h1>

            {locked ? (
                <>
                    <h2>This feature is currently only available for community members</h2>
                    <p>If you want to use it, hit me up on our discord @nedrise</p>
                </>
            ) : !_.isEmpty(state) ? (
                <>
                    <p>{state}</p>
                </>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Element</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        label="Amount"
                                        onChange={(event) => handleAllAmountsInput(_.toInteger(event.target.value))}
                                    />
                                </TableCell>
                                <TableCell sx={{ minWidth: '200px' }}>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {elementsToBuy.map((e, i) => (
                                <ElementToBuyTableRow
                                    key={e.element.address}
                                    pos={i + 1}
                                    element={e.element}
                                    amount={e.amount}
                                    onAmountInput={handleAmountInput}
                                />
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>Total</TableCell>
                                <TableCell>
                                    {_.toInteger(
                                        _.sum(
                                            elementsToBuy.map(
                                                (e) =>
                                                    getElementPriceInShop(e.element.price!, e.element.tier) * e.amount
                                            )
                                        )
                                    )}{' '}
                                    ELE
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                    <Button variant="contained" onClick={buyElements}>
                                        Buy
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

type ElementToBuyTableRowProps = {
    element: Element;
    pos: number;
    amount: number;
    onAmountInput: (elementId: string, amount: number) => void;
};

function ElementToBuyTableRow(props: ElementToBuyTableRowProps) {
    const price = getElementPriceInShop(props.element.price!, props.element.tier);

    return (
        <TableRow>
            <TableCell>{props.pos}</TableCell>
            <TableCell>
                {props.element.name} T{props.element.tier}
            </TableCell>
            <TableCell>{price} ELE</TableCell>
            <TableCell sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <TextField
                    type="number"
                    value={props.amount}
                    onChange={(event) => props.onAmountInput(props.element.address, parseInt(event.target.value, 10))}
                />
                <Button variant="outlined" onClick={() => props.onAmountInput(props.element.address, 0)}>
                    remove
                </Button>
            </TableCell>
            <TableCell>{_.toInteger(price * props.amount)} ELE</TableCell>
        </TableRow>
    );
}

function getElementPriceInShop(price: number, tier: number) {
    return _.toInteger(price * FEES[tier]);
}
