import { Box } from '@mui/material';
import NavigationButtons from "../navigationButtons";


export default function MittelContainer() {
    return (
        <Box sx={{ height: 1, width: 1, display: 'flex', flexDirection: 'column' }}>
            <NavigationButtons
                linkList={[
                    {
                        path: '/mittel/createUserForm',
                        componentName: 'CreateUserForm',
                    },
                    {
                        path: '/mittel/progress',
                        componentName: 'Progress',
                    },
                    {
                        path: '/mittel/holidayListWithSearch',
                        componentName: 'HolidayListWithSearch',
                    },
                    {
                        path: '/mittel/userProfile',
                        componentName: 'UserProfile',
                    },
                ]}
            />

            <Box sx={{ width: 0.6, mx: 'auto' }}>

            </Box>
        </Box>
    );
}
