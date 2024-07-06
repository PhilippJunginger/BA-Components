import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- promise
- setup

- vairablen - 4
- unused import
- unused const


- 5 von 6 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -30
Testumfang: 75,15
 */

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    test('renders user list with initial users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test.skip('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const radioName = screen.getByLabelText('Name');
        const radioEmail = screen.getByLabelText('Email');

        // Default sort by name
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Jane Smith');
        expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('John Doe');

        // Sort by email
        await userEvent.click(radioEmail);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('John Doe');
        expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Jane Smith');
    });

    test('removes user from list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('shows alert when no users match the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('shows alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
