import { Box, List, ListItem, ListItemText, Paper } from '@mui/material';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Header } from '../app/components/Header';

export enum EventTopics {
    inventing = 'inventing',
    inventionAttempt = 'inventionAttempt',
    forging = 'forging',
}

export type ForgeEvent = {
    eventTopic: EventTopics;
    timestamp: number;
    user: string;
    event: any;
    element: string;
    isSuccess: boolean;
    recipe: [string, string, string, string];
};

const socket = io(process.env.NEXT_PUBLIC_WEB_SOCKET_HOST!, { transports: ['websocket', 'polling'] });

export default function FeedPage() {
    const [messages, setMessages] = useState<Record<string, ForgeEvent>>({});

    useEffect(() => {
        socket.on('connect', function () {
            console.log('Connected');
        });
        socket.on('disconnect', function () {
            console.log('Disconnected');
        });

        socket.on('inventing', (message: ForgeEvent | ForgeEvent[]) => {
            if (_.isArray(message)) {
                message.forEach((m) => handleUpdateMessages(m));
            } else {
                handleUpdateMessages(message);
            }
        });

        socket.on('forging', (message: ForgeEvent | ForgeEvent[]) => {
            if (_.isArray(message)) {
                message.forEach((m) => handleUpdateMessages(m));
            } else {
                handleUpdateMessages(message);
            }
        });
    }, []);

    function handleUpdateMessages(forgeEvent: ForgeEvent) {
        const hash = `${forgeEvent.timestamp}${forgeEvent.user}${forgeEvent.element}${forgeEvent.recipe.join('')}`;

        let content = '';
        if (forgeEvent.eventTopic === EventTopics.inventing) {
            content = `Invented ${forgeEvent.element}! The recipe was ${printRecipe(forgeEvent.recipe)}`;
        } else if (forgeEvent.eventTopic === EventTopics.inventionAttempt) {
            content = `Tried a new recipe ${printRecipe(forgeEvent.recipe)}`;
        } else if (forgeEvent.eventTopic === EventTopics.forging) {
            content = `Forged "${forgeEvent.element}" with recipe ${printRecipe(forgeEvent.recipe)}`;
        }

        setMessages((state) => ({
            ...state,
            [hash]: {
                ...forgeEvent,
                event: content,
            },
        }));
    }

    function printRecipe(recipe: [string, string, string, string]): string {
        return `[ ${recipe.join(' + ')} ]`;
    }

    return (
        <>
            <h2>Feed (WIP)</h2>

            <Paper sx={{ width: '90%', margin: '1rem auto' }}>
                <Box>
                    <nav aria-label="secondary mailbox folders">
                        <List>
                            {_.isEmpty(messages) ? (
                                <div>Waiting for events ...</div>
                            ) : (
                                _.orderBy(Object.values(messages), 'timestamp', 'desc').map((message, i) => (
                                    <ListItem key={i}>
                                        <ListItemText>
                                            {new Date(message.timestamp * 1000).toLocaleString()}
                                        </ListItemText>
                                        <ListItemText>{message.user}</ListItemText>
                                        <ListItemText>{message.event}</ListItemText>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </nav>
                </Box>
            </Paper>
        </>
    );
}
