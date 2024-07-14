import { Alert, Box, Button, IconButton, ListItem, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../pages';
import { USER_ROLE } from '../../models/user';
import { Delete } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { RequestDto } from '../leicht/navigationLeicht';
import { NavItem } from '../mittel/navigationMittel';

interface NavigationSchwerProps {
    currentRequest: RequestDto;
    handleRequestDeletion: (id: string) => Promise<void>;
}

const LOCAL_HISTORY_KEY = 'navHistory';

export default function NavigationSchwer(props: NavigationSchwerProps) {
    const { currentRequest, handleRequestDeletion } = props;
    const router = useRouter();

    const { data: navItems, isError } = useQuery<NavItem[]>({
        queryKey: ['navItems'],
        queryFn: async () =>
            await fetch('http://localhost:8080/navItems').then(async (res) => {
                const response = await res.json();
                if (res.status < 200 || res.status >= 300 || !res.ok) {
                    throw response;
                }

                return response;
            }),
    });

    const [alert, setAlert] = useState<string | undefined>(undefined);
    const { role } = useContext(UserContext);
    const [history, setHistory] = useState<string[]>([]);
    const isEmployeeUser = role !== USER_ROLE.CUSTOMER;

    const filteredNavItems = navItems?.filter((navItem) => {
        switch (role) {
            case USER_ROLE.ADMIN:
                return true;
            case USER_ROLE.EMPLOYEE:
                return navItem.requestType === 'employee';
            case USER_ROLE.CUSTOMER:
                return navItem.requestType === 'customer';
        }
    });

    useEffect(() => {
        const storageHistoryData = localStorage.getItem(LOCAL_HISTORY_KEY);
        if (typeof storageHistoryData === 'string') {
            const historyData = JSON.parse(storageHistoryData);
            setHistory(historyData);
        } else {
            setAlert('No history data available');
        }
    }, []);

    const isCurrent = (id: string, name: string, type: string) => {
        if (isEmployeeUser) {
            return currentRequest.id === id;
        }
        return currentRequest.requestType === type && currentRequest.data.name === name;
    };

    const handleNavItemClick = async (value: string, name: string, isCurrentItem: boolean) => {
        if (isCurrentItem) {
            return;
        }

        const updatedHistory = [...history, name];
        setHistory(updatedHistory);
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updatedHistory));

        if (isEmployeeUser) {
            return await router.push({
                pathname: '/request',
                query: {
                    id: value,
                },
            });
        }

        await router.push({
            pathname: '/request',
            query: {
                type: value,
            },
        });
    };

    const handleDeleteNavItem = async (requestId: string) => {
        try {
            await handleRequestDeletion(requestId);
        } catch (err) {
            setAlert('Could not delete NavItem');
        }
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(LOCAL_HISTORY_KEY);
    };

    return (
        <Box>
            {isError && <Alert severity={'error'}>Error while fetching Navigation Items</Alert>}

            {alert && (
                <Alert
                    sx={{ mb: 3 }}
                    severity={'warning'}
                    action={
                        <IconButton aria-label={'close-alert'} onClick={() => setAlert(undefined)}>
                            <CloseIcon />
                        </IconButton>
                    }>
                    {alert}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 10 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                    {history.length > 0 && <Button onClick={clearHistory}>Clear History</Button>}

                    <Typography sx={{ mb: 1 }}>Last visited Items:</Typography>
                    {history.map((historyItem, index) => (
                        <Typography key={historyItem + index} aria-label={historyItem}>
                            {historyItem}
                        </Typography>
                    ))}
                </Box>

                <Tabs
                    variant={'scrollable'}
                    orientation={'vertical'}
                    scrollButtons={'auto'}
                    textColor={'inherit'}
                    value={isEmployeeUser ? currentRequest.id : currentRequest.data.name}>
                    {filteredNavItems?.map(({ requestId, requestType, name }) => {
                        const isCurrentItem = isCurrent(requestId, name, requestType);

                        return (
                            <Tab
                                key={requestId}
                                aria-label={isEmployeeUser ? requestId : name}
                                onClick={() =>
                                    handleNavItemClick(isEmployeeUser ? requestId : requestType, name, isCurrentItem)
                                }
                                value={isEmployeeUser ? requestId : name}
                                sx={{
                                    textTransform: 'none',
                                    textAlign: 'start',
                                    maxWidth: 1,
                                    opacity: 1,
                                    '&:hover': {
                                        backgroundColor: 'grey.200',
                                    },
                                }}
                                label={
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    sx={{
                                                        typography: 'body1',
                                                        fontWeight: 'bold',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: {
                                                            xs: 'none',
                                                            sm: 'block',
                                                        },
                                                        color: !isCurrentItem ? 'grey.500' : 'inherit',
                                                    }}>
                                                    {name}
                                                </Typography>
                                            }
                                        />

                                        {isCurrentItem && role === USER_ROLE.ADMIN && (
                                            <Box
                                                role={'button'}
                                                aria-label={'delete-button'}
                                                sx={{
                                                    ml: 2,
                                                    p: 1,
                                                    '&:hover': {
                                                        backgroundColor: 'grey.500',
                                                    },
                                                }}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await handleDeleteNavItem(requestId);
                                                }}>
                                                <Delete />
                                            </Box>
                                        )}
                                    </ListItem>
                                }
                            />
                        );
                    })}
                </Tabs>
            </Box>
        </Box>
    );
}
