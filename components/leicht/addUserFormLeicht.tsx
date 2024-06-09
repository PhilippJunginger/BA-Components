import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { FormEvent, useState } from 'react';
import { User, USER_ROLE } from '../../models/user';

interface AddUserDialogProps {
    setUsers: (users: User[]) => void;
    users: User[];
}

const initialUser: User = { name: '', email: '', role: '' as USER_ROLE, password: '' };
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export default function AddUserFormLeicht(props: AddUserDialogProps) {
    const { users, setUsers } = props;
    const [newUser, setNewUser] = useState<User>(initialUser);
    const [error, setError] = useState(false);
    const [pwError, setPwError] = useState(false);

    const isNotCustomer = newUser.role === USER_ROLE.ADMIN || newUser.role === USER_ROLE.EMPLOYEE;

    const handleAddUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!passwordRegex.test(newUser.password)) {
            setPwError(true);
            return;
        }

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
        <form
            noValidate
            onSubmit={handleAddUser}
            style={{ width: 400, display: 'flex', flexDirection: 'column', columnGap: 1 }}>
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

            <TextField
                required
                sx={{ my: 2 }}
                value={newUser.password}
                label={'Password'}
                onChange={(e) => handleChange(e.target.value, 'password')}
                error={pwError}
                helperText={
                    pwError && (
                        <ul>
                            <li>Password needs to be 8 characters long</li>
                            <li>Needs to contain at least one uppercase and one lowercase letter</li>
                            <li>Needs to contain at least one digit</li>
                            <li>Needs to contain at least one special character</li>
                        </ul>
                    )
                }
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
