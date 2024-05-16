import { Paper } from '@mui/material';
import Image from 'next/image';

import { Element } from '../stores/shopElements';

type Props = {
    element: Element;
    onClick: (elementId: string) => void;
};

export function ElementCardSmall(props: Props) {
    return (
        <Paper
            sx={{
                width: '90px',
                height: '90px',
                border: '1px solid rgba(100, 100, 100, 0.7)',
                opacity: '0.8',
                ':hover': {
                    opacity: 1,
                },
            }}
            onClick={() => props.onClick?.(props.element.address)}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div>
                        {props.element.name} T{props.element.tier}
                    </div>
                    <Image src={props.element.url} width={40} height={40} alt={`picture of ${props.element.name}`} />
                </div>
            </div>
        </Paper>
    );
}
