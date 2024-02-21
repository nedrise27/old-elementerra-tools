import { Delete } from '@mui/icons-material';
import { TextField, Button } from '@mui/material';
import _ from 'lodash';
import { useState, FormEvent } from 'react';
import { useAssetStore } from '../stores/assets';

export function WalletInput() {
    const addWallet = useAssetStore((state) => state.addWallet);
    const removeWallet = useAssetStore((state) => state.removeWallet);
    const wallets = useAssetStore((state) => state.wallets);

    const [walletAddress, setWalletAddress] = useState('');

    function handleWalletAddressInput(address: string) {
        setWalletAddress(address);
    }

    async function handleWalletSubmit(event: FormEvent) {
        event.preventDefault();
        if (!_.isEmpty(walletAddress)) {
            await addWallet(walletAddress);
            setWalletAddress('');
        }
    }

    function handleRemoveWallet(address: string) {
        removeWallet(address);
        setWalletAddress('');
    }

    return (
        <>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'start',
                    gap: '2 rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flex: 1,
                        justifyContent: 'start',
                        alignItems: 'center',
                        gap: '2rem',
                        flexWrap: "wrap",
                    }}
                >
                    <form
                        style={{ width: '50%', minWidth: '300px', display: 'flex', gap: '0.4rem' }}
                        onSubmit={handleWalletSubmit}
                    >
                        <TextField
                            fullWidth
                            label="Wallet Address"
                            id="walletAddress"
                            variant="outlined"
                            value={walletAddress}
                            onChange={(event) => handleWalletAddressInput(event.target.value)}
                        />
                        <Button type="submit" variant="outlined" disabled={_.isEmpty(walletAddress)}>
                            load
                        </Button>
                    </form>

                    <div>
                        {Object.keys(wallets).map((w) => (
                            <ViewWalletAddressTag key={w} walletAddress={w} onRemove={handleRemoveWallet} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

type ViewWalletTagProps = {
    walletAddress: string;
    onRemove: (walletAddress: string) => void;
};

function ViewWalletAddressTag(props: ViewWalletTagProps) {
    return (
        <Button
            sx={{ marginRight: '0.2rem' }}
            variant="outlined"
            color="error"
            endIcon={<Delete />}
            onClick={() => props.onRemove(props.walletAddress)}
        >
            {props.walletAddress.slice(0, 6)}
        </Button>
    );
}
