import { useState } from 'react';
import { Box, Button } from '@mui/material';
import AddUserDialog from './leicht/components/addUserDialog';
import { User, USER_ROLE } from '../models/user';

export default function AddUserDialogContainer() {
    const [users, setUsers] = useState<User[]>([
        { name: 'Lara', email: 'lara@mail.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Phil', email: 'phil@mail.com', role: USER_ROLE.ADMIN },
        { name: 'Erik', email: 'erik@mail.com', role: USER_ROLE.CUSTOMER },
    ]);
    const [open, setOpen] = useState(false);

    return (
        <Box>
            <Button onClick={() => setOpen(true)}>Open Dialog</Button>

            {open && <AddUserDialog open={open} setOpen={setOpen} setUsers={setUsers} users={users} />}
        </Box>
    );
}
