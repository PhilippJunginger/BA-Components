import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { User, USER_ROLE } from '../../../../models/user.ts';

interface UserListProps {
    users: User[];
    setUsers: (users: User[]) => void;
}

export default function UserList(props: UserListProps) {
    const { users, setUsers } = props;

    const handleRemoveUserFromList = (email: string) => {
        const listWithoutUser = users.filter((user) => user.email !== email);
        setUsers(listWithoutUser);
    };

    const getUserIcon = (userRole: USER_ROLE) => {
        switch (userRole) {
            case USER_ROLE.ADMIN:
                return <BadgeIcon />;
            case USER_ROLE.CUSTOMER:
                return <PersonIcon />;
            case USER_ROLE.EMPLOYEE:
                return <SupervisorAccountIcon />;
        }
    };

    return (
        <List>
            {users.map((user) => (
                <ListItem key={user.email}>
                    <ListItemIcon>{getUserIcon(user.role)}</ListItemIcon>
                    <ListItemText primary={user.name} secondary={user.email} />
                    <ListItemButton onClick={() => handleRemoveUserFromList(user.email)}>Remove</ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}
