import {
    Box,
    FormControl,
    FormControlLabel,
    FormLabel,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Radio,
    RadioGroup,
    Select,
    MenuItem,
    Snackbar,
    TextField,
    Typography,
    Pagination,
    SelectChangeEvent,
    List,
    Alert,
} from '@mui/material';
import { Delete, Edit, Badge, SupervisorAccount } from '@mui/icons-material';
import { ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { UserNoPw } from '../../models/user';

enum USER_ROLE {
    CUSTOMER = 'CUSTOMER',
    EMPLOYEE = 'EMPLOYEE',
    ADMIN = 'ADMIN',
}

interface UserListProps {
    fetchedUsers: UserNoPw[];
}

const rowsPerPage = 5;

export default function UserEmployeeListMittel({ fetchedUsers }: UserListProps) {
    const [users, setUsers] = useState(fetchedUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'email'>('name');
    const [filterRole, setFilterRole] = useState<USER_ROLE | 'all'>('all');
    const [page, setPage] = useState(1);
    const [snackbarMessage, setSnackbarMessage] = useState<string | undefined>(undefined);
    const router = useRouter();

    const filteredUsers = useMemo(() => {
        return users
            .filter(
                (user) =>
                    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    user.role !== USER_ROLE.CUSTOMER &&
                    (filterRole === 'all' || user.role === filterRole),
            )
            .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    }, [users, searchTerm, sortBy, filterRole]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
    }, [page, filteredUsers]);

    const handleRemoveUserFromList = (email: string) => {
        const listWithoutUser = users.filter((user) => user.email !== email);
        setUsers(listWithoutUser);
        setSnackbarMessage('User removed successfully!');
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
    const handleSortBySelection = (e: SelectChangeEvent) => {
        setSortBy(e.target.value as typeof sortBy);
    };
    const handleRoleFilterChange = (e: SelectChangeEvent) => {
        setFilterRole(e.target.value as typeof filterRole);
    };

    const getUserIcon = (userRole: USER_ROLE) => {
        switch (userRole) {
            case USER_ROLE.ADMIN:
                return <Badge />;
            case USER_ROLE.EMPLOYEE:
                return <SupervisorAccount />;
        }
    };

    const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => setPage(value);

    const handleRouteToUserPage = async (userName: string) => {
        await router.push(`/edit/${userName}`);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
            <Typography variant='h4'>User List</Typography>

            {!filteredUsers.length && fetchedUsers.length > 0 && (
                <Alert severity={'info'}>There are no users matching the current search</Alert>
            )}

            {!fetchedUsers.length && <Alert severity={'info'}>There are no users available</Alert>}

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField label='Search Users' value={searchTerm} onChange={handleSearchChange} />
                <FormControl>
                    <FormLabel>Sort by</FormLabel>
                    <RadioGroup row value={sortBy} onChange={handleSortBySelection}>
                        <FormControlLabel control={<Radio />} label={'Name'} value={'name'} />
                        <FormControlLabel control={<Radio />} label={'Email'} value={'email'} />
                    </RadioGroup>
                </FormControl>
                <FormControl>
                    <FormLabel id={'select-label'}>Filter by Role</FormLabel>
                    <Select labelId={'select-label'} value={filterRole} onChange={handleRoleFilterChange}>
                        <MenuItem value='all'>All</MenuItem>
                        {Object.values(USER_ROLE)
                            .filter((role) => role !== USER_ROLE.CUSTOMER)
                            .map((role) => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Box>

            <List aria-label={'user-list'}>
                {paginatedUsers.map((user) => (
                    <ListItem key={user.email} aria-label={user.name}>
                        <ListItemIcon>{getUserIcon(user.role)}</ListItemIcon>
                        <ListItemText primary={user.name} secondary={user.email} />
                        <ListItemButton
                            aria-label={`edit-${user.name}`}
                            onClick={() => handleRouteToUserPage(user.name)}>
                            <Edit />
                        </ListItemButton>
                        <ListItemButton
                            aria-label={`delete-${user.name}`}
                            onClick={() => handleRemoveUserFromList(user.email)}>
                            <Delete />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Pagination count={Math.ceil(filteredUsers.length / rowsPerPage)} page={page} onChange={handlePageChange} />

            <Snackbar
                open={!!snackbarMessage?.length}
                autoHideDuration={2000}
                onClose={() => setSnackbarMessage(undefined)}
                message={snackbarMessage}
            />
        </Box>
    );
}
