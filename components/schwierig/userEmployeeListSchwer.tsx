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
    CircularProgress,
} from '@mui/material';
import { Delete, Edit, Person, Badge, SupervisorAccount } from '@mui/icons-material';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../models/user';

const rowsPerPage = 5;

export default function UserEmployeeListSchwer() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'role'>('name');
    const [filterRole, setFilterRole] = useState<USER_ROLE | 'all'>('all');
    const [page, setPage] = useState(1);
    const [snackbarMessage, setSnackbarMessage] = useState<string | undefined>(undefined);
    const router = useRouter();

    const [fetchingUsers, setFetchingUsers] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setFetchingUsers(true);
            try {
                const fetchedUsers: User[] = await fetch('http://localhost:8080/user').then(async (res) => {
                    const response = await res.json();
                    if (res.status < 200 || res.status >= 300) {
                        throw response;
                    }

                    return response;
                });

                setUsers([...fetchedUsers]);
            } catch (error) {
                setSnackbarMessage('Failed to fetch users.');
            } finally {
                setFetchingUsers(false);
            }
        };

        void fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const filtered = users
            .filter(
                (user) =>
                    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (filterRole === 'all' || user.role === filterRole),
            )
            .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));

        if (!filtered.length) {
            setSnackbarMessage('No matching users found!');
        }

        return filtered;
    }, [users, searchTerm, sortBy, filterRole]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
    }, [page, filteredUsers]);

    const handleRemoveUserFromList = async (email: string) => {
        await fetch(`http://localhost:8080/user?email=${email}`, { method: 'POST' })
            .then(async (res) => {
                const response = await res.json();
                if (res.status < 200 || res.status >= 300) {
                    throw response;
                }

                return response;
            })
            .then(() => {
                const listWithoutUser = users.filter((user) => user.email !== email);
                setUsers(listWithoutUser);
                setSnackbarMessage('User removed successfully!');
            })
            .catch(() => {
                setSnackbarMessage('Deletion of user failed!');
            });
    };

    const handleRouteToUser = async (name: string) => {
        await router.push(`/edit/${name.replace(/\s/g, '')}`);
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
            case USER_ROLE.CUSTOMER:
                return <Person />;
            case USER_ROLE.EMPLOYEE:
                return <SupervisorAccount />;
        }
    };

    const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => setPage(value);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
            <Typography variant='h4'>User List</Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField label='Search Users' value={searchTerm} onChange={handleSearchChange} />
                <FormControl>
                    <FormLabel>Sort by</FormLabel>
                    <RadioGroup row value={sortBy} onChange={handleSortBySelection}>
                        <FormControlLabel control={<Radio />} label={'Name'} value={'name'} />
                        <FormControlLabel control={<Radio />} label={'Email'} value={'email'} />
                        <FormControlLabel control={<Radio />} label={'Role'} value={'role'} />
                    </RadioGroup>
                </FormControl>
                <FormControl>
                    <FormLabel>Filter by Role</FormLabel>
                    <Select value={filterRole} onChange={handleRoleFilterChange}>
                        <MenuItem value='all'>All</MenuItem>
                        {Object.values(USER_ROLE).map((role) => (
                            <MenuItem key={role} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {fetchingUsers ? (
                <CircularProgress />
            ) : (
                <>
                    {paginatedUsers.map((user) => (
                        <ListItem key={user.email} sx={{ display: 'flex', alignItems: 'center' }}>
                            <ListItemIcon>{getUserIcon(user.role)}</ListItemIcon>
                            <ListItemText primary={user.name} secondary={user.email} />
                            <ListItemButton onClick={() => handleRouteToUser(user.name)}>
                                <Edit />
                            </ListItemButton>
                            <ListItemButton onClick={() => handleRemoveUserFromList(user.email)}>
                                <Delete />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <Pagination
                        count={Math.ceil(filteredUsers.length / rowsPerPage)}
                        page={page}
                        onChange={handlePageChange}
                    />
                </>
            )}

            <Snackbar
                open={!!snackbarMessage?.length}
                autoHideDuration={1000}
                onClose={() => setSnackbarMessage(undefined)}
                message={snackbarMessage}
            />
        </Box>
    );
}
