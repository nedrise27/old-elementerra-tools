import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Header } from '../../app/components/Header';
import styles from '../../styles/Feed.module.css';

export enum EventTopics {
    inventing = 'inventing',
    inventionAttempt = 'inventionAttempt',
    forging = 'forging',
}

export type ForgeEvent = {
    eventTopic: EventTopics;
    timestamp: number;
    user: string;
    event?: any;
    element: string;
    isSuccess: boolean;
    preferHidden: boolean;
    recipe: [string, string, string, string];
};

let socket: Socket;

export default function FeedPage() {
    const [messages, setMessages] = useState<Record<string, ForgeEvent>>({});
    const [subscribedFeeds, setSubscribedFeeds] = useState<Record<EventTopics, boolean>>({
        [EventTopics.inventing]: true,
        [EventTopics.inventionAttempt]: true,
        [EventTopics.forging]: true,
    });

    useEffect(() => {
        socket = io(process.env.NEXT_PUBLIC_WEB_SOCKET_HOST!, { transports: ['websocket', 'polling'] });

        socket.on('connect', function () {
            console.log('Connected');
        });

        socket.on('disconnect', function () {
            console.log('Disconnected');
        });

        socket.onAny((eventTopic: string, message: ForgeEvent | ForgeEvent[]) => {
            if (_.isArray(message)) {
                message.forEach((m) => handleUpdateMessages(m));
            } else {
                handleUpdateMessages(message);
            }
        });

        return () => {
            socket.offAny();
        };
    }, [subscribedFeeds]);

    function handleUpdateMessages(forgeEvent: ForgeEvent) {
        if (forgeEvent.preferHidden) {
            return;
        }

        if (!subscribedFeeds[forgeEvent.eventTopic]) {
            return;
        }

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

    function handleFeedTypeSelect(event: any) {
        const checked = event.target.checked;
        const eventTopic = event.target.value;

        setSubscribedFeeds({
            ...subscribedFeeds,
            [eventTopic]: checked,
        });
    }

    return (
        <>
            <div style={{ margin: '1rem auto', maxWidth: 1080 }}>
                <h2>Feed (WIP)</h2>

                <h4 style={{ color: 'orange' }}>
                    If you want your wallet address excluded from here, hit me up on our discord @ nedrise27
                </h4>

                <Box>
                    <FormControl sx={{ minWidth: '150px' }}>
                        <FormGroup aria-label="position" row onChange={handleFeedTypeSelect}>
                            <FormControlLabel
                                value={EventTopics.inventing}
                                checked={subscribedFeeds[EventTopics.inventing]}
                                control={<Checkbox />}
                                label="Inventions"
                                labelPlacement="start"
                            />
                            <FormControlLabel
                                value={EventTopics.inventionAttempt}
                                checked={subscribedFeeds[EventTopics.inventionAttempt]}
                                control={<Checkbox />}
                                label="Invention Attempts"
                                labelPlacement="start"
                            />
                            <FormControlLabel
                                value={EventTopics.forging}
                                checked={subscribedFeeds[EventTopics.forging]}
                                control={<Checkbox />}
                                label="Regular Forge Usage"
                                labelPlacement="start"
                            />
                        </FormGroup>
                    </FormControl>
                </Box>

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
