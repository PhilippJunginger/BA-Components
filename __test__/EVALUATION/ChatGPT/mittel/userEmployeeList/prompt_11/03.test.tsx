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

- unused import - 1
- vairablen - 7
- unnecessary waitFor - 2

- 8 von 10 notwendigen Testfälen erreicht + 1 + 1 Redundanz


Best-Practices: -30
CleanCode: -50
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
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
    });

    test('renders the component with initial users', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('filters users based on search input', async () => {
        await userEvent.type(screen.getByLabelText('Search Users'), 'John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('sorts users by name and email', async () => {
        await userEvent.click(screen.getByLabelText('Email'));
        const sortedUsers = screen.getAllByRole('listitem');
        expect(sortedUsers[0]).toHaveTextContent('Jane Smith');
        expect(sortedUsers[1]).toHaveTextContent('John Doe');
    });

    test('filters users by role', async () => {
        await userEvent.click(screen.getByLabelText('Filter by Role'));
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('removes a user from the list', async () => {
        await userEvent.click(screen.getByLabelText('delete-John Doe'));
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test('navigates to user edit page on edit button click', async () => {
        await userEvent.click(screen.getByLabelText('edit-Jane Smith'));
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/Jane Smith');
        });
    });

    test('displays no users available message when no users are fetched', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('displays no matching users message when search yields no results', async () => {
        await userEvent.type(screen.getByLabelText('Search Users'), 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('handles pagination correctly', async () => {
        const moreUsers = Array.from({ length: 10 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));
        render(<UserEmployeeListMittel fetchedUsers={moreUsers} />);
        expect(screen.getByText('User 1')).toBeInTheDocument();
        await userEvent.click(screen.getByLabelText('Go to page 2'));
        expect(screen.getByText('User 6')).toBeInTheDocument();
    });
});
