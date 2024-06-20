import { Alert, Box, IconButton, ListItem, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { UserContext } from '../../pages';
import { USER_ROLE } from '../../models/user';
import { Delete } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

type RequestType = 'customer' | 'admin' | 'employee';

export type RequestDto = {
    id: string;
    requestType: RequestType;
    data: Record<string, any>;
};

type NavItem = {
    name: string;
    requestId: string;
    requestType: RequestType;
};

interface NavigationLeichtProps {
    navItems: NavItem[];
    currentRequest: RequestDto;
    changeToRequest: (value: string, key: keyof Pick<RequestDto, 'requestType' | 'id'>) => Promise<void>;
    handleRequestDeletion: (id: string) => Promise<void>;
}

export default function NavigationLeicht(props: NavigationLeichtProps) {
    const { navItems, currentRequest, changeToRequest } = props;

    const [alert, setAlert] = useState<boolean>(false);

    const { role } = useContext(UserContext);
    const isEmployeeUser = role !== USER_ROLE.CUSTOMER;

    const filteredNavItems = navItems.filter((navItem) => {
        switch (role) {
            case USER_ROLE.ADMIN:
                return true;
            case USER_ROLE.EMPLOYEE:
                return navItem.requestType === 'employee';
            case USER_ROLE.CUSTOMER:
                return navItem.requestType === 'customer';
        }
    });

    const isCurrent = (id: string, name: string) => {
        if (isEmployeeUser) {
            return currentRequest.id === id;
        }
        return currentRequest.data.name === name;
    };

    const handleNavItemClick = async (value: string) => {
        if (currentRequest.id === value) {
            return;
        }

        if (isEmployeeUser) {
            return await changeToRequest(value, 'id');
        }

        await changeToRequest(value, 'requestType');
    };

    const handleDeleteNavItem = async (requestId: string) => {
        try {
            await handleDeleteNavItem(requestId);
        } catch (err) {
            setAlert(true);
        }
    };

    return (
        <Box>
            {alert && (
                <Alert
                    sx={{ mb: 3 }}
                    severity={'warning'}
                    action={
                        <IconButton onClick={() => setAlert(false)}>
                            <CloseIcon />
                        </IconButton>
                    }>
                    Deletion of NavItem failed
                </Alert>
            )}

            <Tabs
                variant={'scrollable'}
                orientation={'vertical'}
                scrollButtons={'auto'}
                textColor={'inherit'}
                value={isEmployeeUser ? currentRequest.id : currentRequest.requestType}
                TabIndicatorProps={{
                    sx: {
                        left: 0,
                        border: 2,
                        borderColor: 'primary.main',
                    },
                }}>
                {filteredNavItems.map(({ requestId, requestType, name }) => {
                    const isCurrentItem = isCurrent(requestId, name);

                    return (
                        <Tab
                            key={requestId}
                            aria-label={isEmployeeUser ? requestId : requestType}
                            onClick={() => handleNavItemClick(isEmployeeUser ? requestId : requestType)}
                            value={isEmployeeUser ? requestId : requestType}
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
                                        <IconButton
                                            sx={{ ml: 2 }}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await handleDeleteNavItem(requestId);
                                            }}>
                                            <Delete />
                                        </IconButton>
                                    )}
                                </ListItem>
                            }
                        />
                    );
                })}
            </Tabs>
        </Box>
    );
}
