import {
    Alert,
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { FormEvent, useState } from 'react';
import { Cancel } from '@mui/icons-material';
import { User, USER_ROLE } from '../../models/user';

interface AddUserDialogProps {
    setUsers: (users: User[]) => void;
    users: User[];
}

const lowercaseRegex = /(?=.*[a-z])/;
const uppercaseeRegex = /(?=.*[A-Z])/;
const digitRegex = /(?=.*\d)/;
const minLength = /.{8,}/;
const specialCharRegex = /(?=.*[!@#$%^&*])/;

type PasswordError = {
    lowercaseLetter: boolean;
    uppercaseLetter: boolean;
    digit: boolean;
    specialChar: boolean;
    minLength: boolean;
};

const initialUser = { name: '', email: '', role: '' as USER_ROLE, password: '' };

export default function AddUserFormMittel(props: AddUserDialogProps) {
    const { users, setUsers } = props;
    const [newUser, setNewUser] = useState<User>(initialUser);
    const [error, setError] = useState(false);
    const [pwError, setPwError] = useState<PasswordError | undefined>(undefined);

    const isPasswordError = pwError && Object.values(pwError).some((regexCheck) => regexCheck);
    const isNotCustomer = newUser.role === USER_ROLE.ADMIN || newUser.role === USER_ROLE.EMPLOYEE;

    const createUser = async () => {
        return await fetch('http://localhost:8080/user', { method: 'POST', body: JSON.stringify(newUser) }).then(
            async (res) => {
                const response = await res.json();
                if (res.status < 200 || res.status >= 300) {
                    throw response;
                }

                return response;
            },
        );
    };

    const handleAddUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isPasswordError) {
            return;
        }

        const emailAlreadyTaken =
            users.find((user) => user.email.toLowerCase() === newUser.email.toLowerCase()) !== undefined;
        if (emailAlreadyTaken) {
            setError(true);
            return;
        }

        try {
            await createUser();
            const updatedUserList = [...users, newUser];
            setUsers(updatedUserList);
            setNewUser(initialUser);
        } catch (err) {
            setError(true);
        }
    };

    const handleChange = (value: string, key: keyof User) => {
        if (key === 'password') {
            setPwError(checkEnteredPassword(value));
        }

        setNewUser({
            ...newUser,
            [key]: value,
        });
    };

    function checkEnteredPassword(password: string): PasswordError {
        return {
            digit: !digitRegex.test(password),
            lowercaseLetter: !lowercaseRegex.test(password),
            uppercaseLetter: !uppercaseeRegex.test(password),
            specialChar: !specialCharRegex.test(password),
            minLength: !minLength.test(password),
        };
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography typography={'h3'}>Create new User</Typography>

            {error && (
                <Alert
                    severity={'error'}
                    action={
                        <IconButton aria-label={'close-icon'} onClick={() => setError(false)}>
                            <Cancel />
                        </IconButton>
                    }>
                    Es ist ein Fehler aufgetreten!
                </Alert>
            )}

            <form noValidate onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column' }}>
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

                <FormControl>
                    <TextField
                        required
                        sx={{ my: 2 }}
                        value={newUser.password}
                        label={'Password'}
                        onChange={(e) => handleChange(e.target.value, 'password')}
                        error={isPasswordError}
                    />
                    {isPasswordError && (
                        <FormHelperText component={'span'}>
                            <ul>
                                <li>Password needs to be 8 characters long</li>
                                <li>Needs to contain at least one uppercase and one lowercase letter</li>
                                <li>Needs to contain at least one digit</li>
                                <li>Needs to contain at least one special character</li>
                            </ul>
                        </FormHelperText>
                    )}
                </FormControl>

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

                <Button variant={'contained'} type={'submit'} sx={{ mt: 4 }}>
                    Add User
                </Button>
            </form>
        </Box>
    );
}
