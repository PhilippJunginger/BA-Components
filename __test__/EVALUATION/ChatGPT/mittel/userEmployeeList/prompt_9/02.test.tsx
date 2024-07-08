import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- setup
- render beforeEach

- unused import
- vairablen - 6
- enum

- 8 von 10 notwendigen Testfälen erreicht + 3 Redundanz


Best-Practices: -30
CleanCode: -40
Testumfang: 65
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
    });

    test('renders the User List title', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    test('renders users in the list', () => {
        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    test('filters users based on search term', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).toBeNull();
    });

    test.skip('sorts users by name and email', async () => {
        const sortByName = screen.getByLabelText('Name');
        const sortByEmail = screen.getByLabelText('Email');

        // Sort by name
        await userEvent.click(sortByName);
        const sortedByName = screen.getAllByRole('listitem').map((li) => li.textContent);
        expect(sortedByName).toEqual([
            'Alice',
            'alice@example.comEditDelete',
            'Bob',
            'bob@example.comEditDelete',
            'Charlie',
            'charlie@example.comEditDelete',
        ]);

        // Sort by email
        await userEvent.click(sortByEmail);
        const sortedByEmail = screen.getAllByRole('listitem').map((li) => li.textContent);
        expect(sortedByEmail).toEqual([
            'Alice',
            'alice@example.comEditDelete',
            'Bob',
            'bob@example.comEditDelete',
            'Charlie',
            'charlie@example.comEditDelete',
        ]);
    });

    test.skip('filters users by role', async () => {
        const roleFilter = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleFilter, 'EMPLOYEE');
        expect(screen.queryByText('Alice')).toBeNull();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    test.skip('pagination works correctly', async () => {
        // Assuming 5 users per page, add more users if needed
        const pagination = screen.getByRole('navigation');
        const secondPageButton = within(pagination).getByText('2');
        await userEvent.click(secondPageButton);
        expect(screen.getByRole('navigation')).toHaveTextContent('2');
    });

    test('removes user from the list', async () => {
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Alice')).toBeNull();
    });

    test('shows snackbar message when user is removed', async () => {
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test('routes to user edit page on edit button click', async () => {
        const editButton = screen.getByLabelText('edit-Alice');
        await userEvent.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    test('displays alert when no users match the search criteria', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays alert when there are no users available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
