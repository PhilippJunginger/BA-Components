import { Tab, Tabs, Typography } from '@mui/material';

type RequestDto = {
    id: string;
    requestType: string;
    data: Record<string, any>;
};

enum ROUTER_PATHS {
    EMPLOYEE = '/employee',
    CUSTOMER = '/customer',
}

interface NavigationLeichtProps {
    navItems: {
        name: string;
        requestId: string;
        requestType: string;
    }[];
    currentRequest: RequestDto;
    currentPathname: string;
    handleRouting: (route: string) => Promise<void>;
}

export default function NavigationLeicht(props: NavigationLeichtProps) {
    const { navItems, currentRequest, handleRouting, currentPathname } = props;

    const employeeView = currentPathname === ROUTER_PATHS.EMPLOYEE;
    const editView = currentPathname === ROUTER_PATHS.CUSTOMER;

    const isCurrent = (id: string, type: string) => {
        if (employeeView || editView) {
            return currentRequest.id === id;
        }
        return currentRequest.requestType === type;
    };

    const currentTab: number = navItems.findIndex((item) => {
        if ((employeeView || editView) && item.requestId) {
            return item.requestId === currentRequest.id && item.requestType === currentRequest.requestType;
        } else {
            return item.requestType === currentRequest.requestType;
        }
    });
    const getActiveTab: number = currentTab > -1 ? currentTab : 0;

    const handleNavItemClick = async (value: string) => {
        if (currentRequest.id === value) {
            return;
        }

        if (employeeView) {
            await handleRouting(ROUTER_PATHS.EMPLOYEE + `?id=${value}`);
        } else {
            await handleRouting(ROUTER_PATHS.CUSTOMER + `?type=${value}`);
        }
    };

    return (
        <Tabs
            variant={'scrollable'}
            orientation={'vertical'}
            scrollButtons={'auto'}
            textColor={'inherit'}
            value={getActiveTab}
            sx={{ height: 1 }}
            TabIndicatorProps={{
                sx: {
                    left: 0,
                    border: 4,
                    borderColor: 'primary.main',
                },
            }}>
            {navItems.map(({ requestId, requestType, name }) => {
                return (
                    <Tab
                        key={requestId}
                        aria-selected={isCurrent(requestId, requestType)}
                        aria-label={requestId}
                        onClick={() => handleNavItemClick(employeeView ? requestId : requestType)}
                        value={requestId}
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
                                    color: !isCurrent(requestId, requestType) ? 'grey.500' : 'inherit',
                                }}>
                                {name}
                            </Typography>
                        }
                    />
                );
            })}
        </Tabs>
    );
}
