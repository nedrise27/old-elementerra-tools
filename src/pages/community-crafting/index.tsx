import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import _ from 'lodash';

import { useAssetStore } from '../../app/stores/assets';
import { DAS } from 'helius-sdk';
import { Element, useElementsInfoStore } from '../../app/stores/shopElements';
import { useConnection } from '@solana/wallet-adapter-react';
import { Box } from '@mui/material';
import { ElementCardSmall } from '../../app/components/ElementCardSmall';

const WALLET = new PublicKey('HHNbp2J4GnrDbHgHnzEz4L6bHfm819tfGPTrtPy8hWvW');

export default function CommunityCraftingPage() {
    const { connection } = useConnection();

    const addWallet = useAssetStore((state) => state.addWallet);
    const removeWallet = useAssetStore((state) => state.removeWallet);
    const wallets = useAssetStore((state) => state.wallets);
    const walletLoadingState = useAssetStore((state) => state.loadingState);

    const elements = useElementsInfoStore((state) => state.elements);
    const elementsRecordName = useElementsInfoStore((state) => state.elementsRecordName);
    const fetchElements = useElementsInfoStore((state) => state.fetch);

    const [walletAddress, setWalletAddress] = useState(WALLET.toString());
    const [walletElements, setWalletElements] = useState<Element[]>([]);

    useEffect(() => {
        fetchElements(connection);
    }, [fetchElements, connection]);

    useEffect(() => {
        if (!_.isNil(walletAddress) && !_.isEmpty(walletAddress)) {
            addWallet(walletAddress);
        }
    }, [elements]);

    useEffect(() => {
        if (walletLoadingState !== 'loaded' || _.isEmpty(wallets) || _.isEmpty(elementsRecordName)) {
            return;
        }

        const wallet = _.first(Object.values(wallets));

        if (!_.isNil(wallet)) {
            const elements = [];
            for (const walletElement of wallet.elements) {
                const name = walletElement.content?.metadata.name.replace(' ', '');
                if (!_.isNil(name) && !_.isEmpty(name)) {
                    const element = elementsRecordName[name];
                    if (!_.isNil(element)) {
                        elements.push(element);
                    }
                }
            }
            setWalletElements(elements);
        }
    }, [wallets, walletLoadingState, elementsRecordName]);

    function handleSelectElementToForge(element: Element) {
    }

    return (
        <>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* <Box sx={{}}>
                    <h2>Buy elements:</h2>
                </Box> */}

                <Box sx={{}}>
                    <h2>Elements in wallet:</h2>
                    <div>
                        {!_.isNil(walletElements) &&
                            !_.isEmpty(walletElements) &&
                            walletElements.map((e) => (
                                <ElementCardSmall
                                    key={e.address}
                                    element={e}
                                    onClick={() => handleSelectElementToForge(e)}
                                />
                            ))}
                    </div>
                </Box>

                <Box sx={{}}>
                    <h2>Forge</h2>
                </Box>
            </div>
        </>
    );
}
