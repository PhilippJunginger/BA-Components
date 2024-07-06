import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- promises
- node access
- setup

- vairablen - 6
- unused import

- 5 von 6 notwendigen Testfälen erreicht + 1 Ausnahme + 3 Redundanzen


Best-Practices: -30
CleanCode: -35
Testumfang: 58,45
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    test.skip('renders component with initial props', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
    });

    test('filters out CUSTOMER role users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    test('displays message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('displays message when no users match the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('sorts users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('Name'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Jane Smith');
        expect(userItems[1]).toHaveTextContent('John Doe');
    });

    test.skip('sorts users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('Email'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice Johnson');
        expect(userItems[1]).toHaveTextContent('Jane Smith');
        expect(userItems[2]).toHaveTextContent('John Doe');
    });

    test('removes user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('delete-John Doe'));
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('displays correct icons for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByLabelText('John Doe').querySelector('svg')).toHaveAttribute('data-testid', 'BadgeIcon');
        expect(screen.getByLabelText('Jane Smith').querySelector('svg')).toHaveAttribute(
            'data-testid',
            'SupervisorAccountIcon',
        );
    });
});
