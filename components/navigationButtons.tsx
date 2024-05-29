import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavigationButtonsProps {
    linkList: {
        path: string;
        componentName: string;
    }[];
}

export default function NavigationButtons(props: NavigationButtonsProps) {
    const { linkList } = props;

    const navigate = useNavigate();
    const location = useLocation();

    const handleComponentSelection = (pathToComponent: string) => {
        navigate(pathToComponent);
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
            <FormControl sx={{ width: 300 }}>
                <InputLabel>Komponente auswählen</InputLabel>
                <Select
                    value={location.pathname}
                    label={'Komponente auswählen'}
                    onChange={(e) => handleComponentSelection(e.target.value as string)}>
                    {linkList.map((link) => (
                        <MenuItem value={link.path}>{link.componentName}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button sx={{ alignSelf: 'center' }} variant={'outlined'} component={Link} to={'/'}>
                Zurück zur Übersicht
            </Button>
        </Box>
    );
}
