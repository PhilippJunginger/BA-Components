import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import { useState } from 'react';
import { User, USER_ROLE } from '../../../../models/user.ts';

interface AddUserDialogProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    setUsers: (users: User[]) => void;
    users: User[];
}

export default function AddUserDialog(props: AddUserDialogProps) {
    const { open, setOpen, users, setUsers } = props;
    const [newUser, setNewUser] = useState<User>({ name: '', email: '', role: '' as USER_ROLE });

    const handleAddUser = () => {
        const updatedUserList = [...users, newUser];
        setUsers(updatedUserList);
        handleClose();
    };

    const handleChange = (value: string, key: keyof User) => {
        setNewUser({
            ...newUser,
            [key]: value,
        });
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog onClose={handleClose} open={open} fullWidth>
            <DialogTitle>Add new User</DialogTitle>
            <form onSubmit={handleAddUser}>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
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
                        <Select
                            label={'Role'}
                            value={newUser.role}
                            onChange={(e) => handleChange(e.target.value, 'role')}>
                            {Object.values(USER_ROLE).map((userRole) => (
                                <MenuItem value={userRole}>{userRole}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'space-between' }}>
                    <Button variant={'outlined'} onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant={'contained'} type={'submit'}>
                        Add User
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
