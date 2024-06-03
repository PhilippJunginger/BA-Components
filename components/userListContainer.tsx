import { useState } from 'react';
import { User, USER_ROLE } from '../models/user';
import UserList from './leicht/components/userList';

export default function UserListContainer() {
    const [users, setUsers] = useState<User[]>([
        { name: 'Lara', email: 'lara@mail.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Phil', email: 'phil@mail.com', role: USER_ROLE.ADMIN },
        { name: 'Erik', email: 'erik@mail.com', role: USER_ROLE.CUSTOMER },
    ]);

    return <UserList users={users} setUsers={setUsers} />;
}
