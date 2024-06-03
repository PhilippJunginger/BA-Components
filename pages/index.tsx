import Lottospiel from '../components/mittel/lottospiel';

('use-client');
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { useState } from 'react';
import AddUserForm from '../components/leicht/addUserForm';
import { User } from '../models/user';
import UserEmployeeList from '../components/leicht/userEmployeeList';

enum DIFFUCULTY {
    LEICHT = 'Leicht',
    MITTEL = 'Mittel',
    SCHWER = 'Schwer',
}

type Komponenten = {
    [DIFFUCULTY.LEICHT]: Record<string, React.JSX.Element>;
    [DIFFUCULTY.MITTEL]: Record<string, React.JSX.Element>;
    [DIFFUCULTY.SCHWER]: Record<string, React.JSX.Element>;
};

export default function Home() {
    const [users, setUsers] = useState<User[]>([]);
    const [difficulty, setDifficulty] = useState<DIFFUCULTY>(DIFFUCULTY.LEICHT);
    const [component, setComponent] = useState<string>('');

    const Komponenten: Komponenten = {
        [DIFFUCULTY.LEICHT]: {
            addUserDialog: <AddUserForm setUsers={setUsers} users={users} />,
            userList: <UserEmployeeList fetchedUsers={users} />,
        },
        [DIFFUCULTY.MITTEL]: {
            lottospiel: <Lottospiel />,
        },
        [DIFFUCULTY.SCHWER]: {},
    };

    const handleDifficultyChange = (e: SelectChangeEvent) => {
        const value = e.target.value;
        setDifficulty(value as DIFFUCULTY);
    };

    const handleComponentSelection = (e: SelectChangeEvent) => {
        const value = e.target.value;
        setComponent(value);
    };

    return (
        <Box sx={{ width: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', columnGap: 2, mx: 'auto' }}>
                <FormControl sx={{ width: 200 }}>
                    <InputLabel>Schwierigkeitsgrad</InputLabel>
                    <Select
                        label={'Schwierigkeitsgrad'}
                        value={difficulty ?? ''}
                        onChange={handleDifficultyChange}
                        labelId={'difficulty-webhweihgw'}>
                        {Object.values(DIFFUCULTY).map((difficulty) => (
                            <MenuItem key={difficulty} value={difficulty}>
                                {difficulty}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ width: 200 }}>
                    <InputLabel>Komponente</InputLabel>
                    <Select onChange={handleComponentSelection} value={component} label={'Komponente'}>
                        {Object.keys(Komponenten[difficulty]).map((componentName) => (
                            <MenuItem key={componentName} value={componentName}>
                                {componentName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ mx: 'auto', mt: 10, width: 'fit-content', height: 'fit-content' }}>
                {Komponenten[difficulty][component]}
            </Box>
        </Box>
    );
}
