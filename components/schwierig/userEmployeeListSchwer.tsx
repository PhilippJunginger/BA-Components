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
    MenuItem,
    Pagination,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import { Badge, Delete, Edit, Person, SupervisorAccount } from '@mui/icons-material';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../models/user';
import { useQuery } from '@tanstack/react-query';

const rowsPerPage = 5;

export default function UserEmployeeListSchwer() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'email'>('name');
    const [filterRole, setFilterRole] = useState<USER_ROLE | 'all'>('all');
    const [page, setPage] = useState(1);
    const [snackbarMessage, setSnackbarMessage] = useState<string | undefined>(undefined);
    const router = useRouter();

    const {
        data: fetchedUsers,
        isError,
        refetch,
    } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () =>
            await fetch('http://localhost:8080/users').then(async (res) => {
                if (res.status < 200 || res.status >= 300) {
                    throw res;
                }

                return await res.json();
            }),
    });

    useEffect(() => {
        if (fetchedUsers) {
            setUsers([...fetchedUsers]);
        }
    }, [fetchedUsers]);

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
    }, [page, filteredUsers.length]);

    const handleRemoveUserFromList = async (email: string) => {
        await fetch(`http://localhost:8080/user?email=${email}`, { method: 'POST' })
            .then(async (res) => {
                const response = res.json();
                if (res.status < 200 || res.status >= 300) {
                    throw response;
                }

                return response;
            })
            .then(async () => {
                const { data } = await refetch();
                if (data) {
                    setUsers([...data]);
                }
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

            {isError && <Alert severity={'error'}>An error occurred while retrieving users</Alert>}

            {!filteredUsers.length && fetchedUsers && fetchedUsers.length > 0 && (
                <Alert severity={'info'}>There are no users matching the current search</Alert>
            )}

            {fetchedUsers && !fetchedUsers.length && <Alert severity={'info'}>No Users created</Alert>}

            <List>
                {paginatedUsers.map((user) => (
                    <ListItem key={user.email} aria-label={user.name}>
                        <ListItemIcon>{getUserIcon(user.role)}</ListItemIcon>
                        <ListItemText primary={user.name} secondary={user.email} />
                        <ListItemButton aria-label={`edit-${user.name}`} onClick={() => handleRouteToUser(user.name)}>
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
                autoHideDuration={1000}
                onClose={() => setSnackbarMessage(undefined)}
                message={snackbarMessage}
            />
        </Box>
    );
}
