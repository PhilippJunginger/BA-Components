import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { FormEvent, useState } from 'react';
import { User, USER_ROLE } from '../../models/user';

interface AddUserDialogProps {
    setUsers: (users: User[]) => void;
    users: User[];
}

const initialUser: User = { name: '', email: '', role: '' as USER_ROLE };

export default function AddUserForm(props: AddUserDialogProps) {
    const { users, setUsers } = props;
    const [newUser, setNewUser] = useState<User>(initialUser);
    const [error, setError] = useState(false);

    const isNotCustomer = newUser.role === USER_ROLE.ADMIN || newUser.role === USER_ROLE.EMPLOYEE;

    const handleAddUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const emailAlreadyTaken = users.find((user) => user.email === newUser.email) !== undefined;

        if (emailAlreadyTaken) {
            setError(true);
            return;
        }

        setUsers([...users, newUser]);
        setNewUser(initialUser);
    };

    const handleChange = (value: string, key: keyof User) => {
        setNewUser({
            ...newUser,
            [key]: value,
        });
    };

    return (
        <form onSubmit={handleAddUser} style={{ width: 400, display: 'flex', flexDirection: 'column', columnGap: 1 }}>
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
                error={error}
                helperText={error && 'Email already exists!'}
            />
            <FormControl required>
                <InputLabel>Role</InputLabel>
                <Select label={'Role'} value={newUser.role} onChange={(e) => handleChange(e.target.value, 'role')}>
                    {Object.values(USER_ROLE).map((userRole) => (
                        <MenuItem key={userRole} value={userRole}>
                            {userRole}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {isNotCustomer && (
                <TextField
                    required
                    sx={{ my: 2 }}
                    value={newUser.department}
                    label={'Department'}
                    onChange={(e) => handleChange(e.target.value, 'department')}
                />
            )}

            <Button type={'submit'}>Add User</Button>
        </form>
    );
}
