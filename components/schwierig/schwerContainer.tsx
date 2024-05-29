import { Box } from '@mui/material';
import NavigationButtons from '../navigationButtons.tsx';
import { Outlet } from 'react-router-dom';

export default function SchwerContainer() {
    return (
        <Box sx={{ height: 1, width: 1, display: 'flex', flexDirection: 'column' }}>
            <NavigationButtons
                linkList={[
                    {
                        path: '/leicht/addUserDialog',
                        componentName: 'CreateUserForm',
                    },
                    {
                        path: '/leicht/counterButton',
                        componentName: 'CounterButton',
                    },
                    {
                        path: '/leicht/greetingCard',
                        componentName: 'GreetingCard',
                    },
                    {
                        path: '/leicht/userList',
                        componentName: 'UserList',
                    },
                ]}
            />

            <Box sx={{ width: 0.6, mx: 'auto' }}>
                <Outlet />
            </Box>
        </Box>
    );
}
