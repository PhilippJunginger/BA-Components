import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- render in beforeEach
- setup
- promises

- unused import - 2
- vairablen - 6

- 8 von 10 notwendigen Testfälen erreicht + 1 + 1 Redundanz


Best-Practices: -30
CleanCode: -40
Testumfang: 75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

const users: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Dave', email: 'dave@example.com', role: USER_ROLE.ADMIN },
    { name: 'Eve', email: 'eve@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Frank', email: 'frank@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
    });

    test.skip('renders user list and pagination', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('user-list')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /1/i })).toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        await userEvent.type(screen.getByLabelText('Search Users'), 'Alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test.skip('sorts users by name and email', async () => {
        await userEvent.click(screen.getByLabelText('Email'));
        const sortedByEmail = screen.getAllByLabelText(/edit-/i).map((btn) => btn.getAttribute('aria-label'));
        expect(sortedByEmail).toEqual([
            'edit-alice',
            'edit-bob',
            'edit-charlie',
            'edit-dave',
            'edit-eve',
            'edit-frank',
        ]);
    });

    test('filters users by role', async () => {
        await userEvent.click(screen.getByLabelText('Filter by Role'));
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Dave')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('removes user from list and shows snackbar', async () => {
        await userEvent.click(screen.getByLabelText('delete-Alice'));
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        await screen.findByText('User removed successfully!');
    });

    test('navigates to user edit page on edit button click', async () => {
        await userEvent.click(screen.getByLabelText('edit-Alice'));
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    test('displays message when no users match search', async () => {
        await userEvent.type(screen.getByLabelText('Search Users'), 'Nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('paginates users correctly', async () => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('Dave')).toBeInTheDocument();
        expect(screen.getByText('Eve')).toBeInTheDocument();
        expect(screen.queryByText('Frank')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /2/i }));
        expect(screen.getByText('Frank')).toBeInTheDocument();
    });
});
