import Lottospiel from '../components/mittel/lottospiel';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { useState } from 'react';
import AddUserFormLeicht from '../components/leicht/addUserFormLeicht';
import { User, USER_ROLE } from '../models/user';
import UserEmployeeListLeicht from '../components/leicht/userEmployeeListLeicht';
import AddUserFormMittel from '../components/mittel/addUserFormMittel';
import UserEmployeeListMittel from '../components/mittel/userEmployeeListMittel';
import UserEmployeeListSchwer from '../components/schwierig/userEmployeeListSchwer';

('use-client');

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
    const [users, setUsers] = useState<User[]>([
        {
            name: 'Test',
            role: USER_ROLE.CUSTOMER,
            password: '123',
            email: 'email@email.com',
        },
    ]);
    const [difficulty, setDifficulty] = useState<DIFFUCULTY>(DIFFUCULTY.LEICHT);
    const [component, setComponent] = useState<string>('');

    const Komponenten: Komponenten = {
        [DIFFUCULTY.LEICHT]: {
            addUserForm: <AddUserFormLeicht key={users.length} setUsers={setUsers} users={users} />,
            userList: <UserEmployeeListLeicht fetchedUsers={users} />,
        },
        [DIFFUCULTY.MITTEL]: {
            lottospiel: <Lottospiel />,
            addUserForm: <AddUserFormMittel key={users.length} setUsers={setUsers} users={users} />,
            userEmployeeList: <UserEmployeeListMittel fetchedUsers={users} />,
        },
        [DIFFUCULTY.SCHWER]: {
            userEmployeeList: <UserEmployeeListSchwer />,
        },
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
