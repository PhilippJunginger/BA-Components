import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserList from './UserList';
import { User, USER_ROLE } from '../../models/user';

describe('UserList Component', () => {
    const initialUsers: User[] = [
        { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.ADMIN },
        { name: 'Bob Smith', email: 'bob@example.com', role: USER_ROLE.CUSTOMER },
        { name: 'Charlie Davis', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    it('renders correctly with initial users', () => {
        render(<UserList fetchedUsers={initialUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Davis')).toBeInTheDocument();
    });

    it('filters users based on search input', async () => {
        render(<UserList fetchedUsers={initialUsers} />);
        const searchField = screen.getByLabelText('Search Users');
        await userEvent.type(searchField, 'Alice');
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).toBeNull();
        expect(screen.queryByText('Charlie Davis')).toBeNull();
    });

    it('sorts users by name or email', async () => {
        render(<UserList fetchedUsers={initialUsers} />);
        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);
        const sortedEmails = screen.getAllByRole('listitem').map((li) => li.textContent?.match(/@[^ ]+/)?.[0]);
        expect(sortedEmails).toEqual(['alice@example.com', 'bob@example.com', 'charlie@example.com'].sort());
    });

    it('deletes a user from the list', async () => {
        render(<UserList fetchedUsers={initialUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Alice Johnson')).toBeNull();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    it('shows alert message when no users match the search', async () => {
        render(<UserList fetchedUsers={initialUsers} />);
        const searchField = screen.getByLabelText('Search Users');
        await userEvent.type(searchField, 'Unknown User');
        expect(screen.getByText('There are no users available or matching the current search')).toBeInTheDocument();
    });
});
