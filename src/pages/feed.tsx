import { Box, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Header } from '../app/components/Header';
import styles from '../styles/Feed.module.css';

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
            <div style={{ margin: '1rem auto', maxWidth: 1080 }}>
                <h2>Feed (WIP)</h2>

                <h4 style={{ color: 'orange' }}>
                    We will not show invention attempts anymore. Only when the forge is used with a known recipe or a
                    new recipe was found.
                </h4>

                <Paper>
                    <Box>
                        <nav aria-label="secondary mailbox folders">
                            <List>
                                {_.isEmpty(messages) ? (
                                    <div>Waiting for events ...</div>
                                ) : (
                                    _.orderBy(Object.values(messages), 'timestamp', 'desc').map((message, i) => (
                                        <ListItem
                                            className={styles.ListItem}
                                            key={i}
                                            alignItems="center"
                                            divider={i < Object.keys(messages).length - 1}
                                        >
                                            <ListItemText className={styles.ListItemTimestamp}>
                                                {new Date(message.timestamp * 1000).toLocaleString()}
                                            </ListItemText>
                                            <ListItemText primary={message.event} secondary={message.user} />
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </nav>
                    </Box>
                </Paper>
            </div>
        </>
    );
}
