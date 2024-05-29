import {
    Alert,
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { User, USER_ROLE } from '../../../../models/user.ts';
import { Cancel } from '@mui/icons-material';

interface AddUserDialogProps {
    setUsers: (users: User[]) => void;
    users: User[];
}

export default function CreateUserForm(props: AddUserDialogProps) {
    const { users, setUsers } = props;
    const [newUser, setNewUser] = useState<User>({ name: '', email: '', role: '' as USER_ROLE });
    const [error, setError] = useState(false);

    const createUser = async () => {
        return fetch('http://localhost:8080/user', { method: 'POST', body: JSON.stringify(newUser) })
            .then(async (res) => {
                if (res.status < 200 || res.status >= 300) {
                    const response = await res.json();
                    throw await response;
                }

                return await res.json();
            })
            .catch(async (err) => {
                throw err;
            });
    };

    const handleAddUser = async () => {
        try {
            await createUser();
            const updatedUserList = [...users, newUser];
            setUsers(updatedUserList);
        } catch (err) {
            setError(true);
        }
    };

    const handleChange = (value: string, key: keyof User) => {
        setNewUser({
            ...newUser,
            [key]: value,
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography typography={'h3'}>Create new User</Typography>

            {error && (
                <Alert
                    severity={'error'}
                    action={
                        <IconButton onClick={() => setError(false)}>
                            <Cancel />
                        </IconButton>
                    }>
                    Es ist ein Fehler aufgetreten!
                </Alert>
            )}

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column' }}>
                <TextField
                    required
                    sx={{ mt: 2 }}
                    value={newUser.name}
                    label={'Name'}
                    onChange={(e) => handleChange(e.target.value, 'name')}
                />
                <TextField
                    required
                    sx={{ my: 2 }}
                    value={newUser.email}
                    label={'Email'}
                    onChange={(e) => handleChange(e.target.value, 'email')}
                />
                <FormControl required>
                    <InputLabel>Role</InputLabel>
                    <Select label={'Role'} value={newUser.role} onChange={(e) => handleChange(e.target.value, 'role')}>
                        {Object.values(USER_ROLE).map((userRole) => (
                            <MenuItem value={userRole}>{userRole}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button variant={'contained'} type={'submit'} sx={{ mt: 4 }}>
                    Add User
                </Button>
            </form>
        </Box>
    );
}
