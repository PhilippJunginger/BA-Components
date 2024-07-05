import {
    Alert,
    Box,
    FormControl,
    FormControlLabel,
    FormLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { USER_ROLE, UserNoPw } from '../../models/user';
import { Delete } from '@mui/icons-material';
import { ChangeEvent, useMemo, useState } from 'react';

interface UserListProps {
    fetchedUsers: UserNoPw[];
}

export default function UserEmployeeListLeicht(props: UserListProps) {
    const { fetchedUsers } = props;

    const [users, setUsers] = useState(fetchedUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'email'>('name');

    const filteredUsers = useMemo(() => {
        return users
            .filter(
                (user) =>
                    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    user.role !== USER_ROLE.CUSTOMER,
            )
            .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    }, [users, searchTerm, sortBy]);

    const handleRemoveUserFromList = (email: string) => {
        const listWithoutUser = users.filter((user) => user.email !== email);
        setUsers(listWithoutUser);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    const handleSortBySelection = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSortBy(value as 'name' | 'email');
    };

    const getUserIcon = (userRole: USER_ROLE) => {
        switch (userRole) {
            case USER_ROLE.ADMIN:
                return <BadgeIcon />;
            case USER_ROLE.EMPLOYEE:
                return <SupervisorAccountIcon />;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
            <Typography typography={'h4'}>User List</Typography>

            <FormControl>
                <FormLabel>Sort by</FormLabel>
                <RadioGroup value={sortBy} onChange={handleSortBySelection}>
                    <FormControlLabel control={<Radio value={'name'} />} label={'Name'} />
                    <FormControlLabel control={<Radio value={'email'} />} label={'Email'} />
                </RadioGroup>
            </FormControl>

            <TextField label={'Search Users'} value={searchTerm} onChange={handleSearchChange} />

            {!filteredUsers.length && fetchedUsers.length > 0 && (
                <Alert severity={'info'}>There are no users matching the current search</Alert>
            )}

            {!fetchedUsers.length ? (
                <Alert severity={'info'}>There are no users available</Alert>
            ) : (
                <List>
                    {filteredUsers.map((user) => (
                        <ListItem key={user.email} aria-label={user.name}>
                            <ListItemIcon>{getUserIcon(user.role)}</ListItemIcon>
                            <ListItemText primary={user.name} secondary={user.email} />
                            <ListItemButton
                                aria-label={`delete-${user.name}`}
                                onClick={() => handleRemoveUserFromList(user.email)}>
                                <ListItemIcon>
                                    <Delete />
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}
