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


- 6 von 6 notwendigen Testfälen erreicht


Best-Practices: -20
CleanCode: -25
Testumfang: 100
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Smith', email: 'bob@example.com', role: USER_ROLE.ADMIN },
    { name: 'Charlie Brown', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'David Williams', email: 'david@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    test('renders the user list and filters out customers', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByLabelText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByLabelText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByLabelText('David Williams')).not.toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Search Users'), 'Alice');
        expect(screen.getByLabelText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob Smith')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie Brown')).not.toBeInTheDocument();
    });

    test('shows alert when no users match search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Search Users'), 'Nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('shows alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test.skip('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const radioName = screen.getByLabelText('Name');
        const radioEmail = screen.getByLabelText('Email');

        // Default sort by name
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice Johnson');
        expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Bob Smith');

        // Sort by email
        await userEvent.click(radioEmail);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice Johnson');
        expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Charlie Brown');
    });

    test('removes a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const deleteButton = screen.getByLabelText('delete-Alice Johnson');
        await userEvent.click(deleteButton);

        expect(screen.queryByLabelText('Alice Johnson')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByLabelText('Charlie Brown')).toBeInTheDocument();
    });
});
