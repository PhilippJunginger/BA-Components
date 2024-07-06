import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

- 6 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -30
CleanCode: -35
Testumfang: 55
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
    });

    test('renders user list with fetched users', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    test('sorts users by name and email', async () => {
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        // Default sort by name
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice Johnson');

        // Sort by email
        await userEvent.click(emailRadio);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice Johnson');
    });

    test.skip('filters users by role', async () => {
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    test('removes user from list and shows snackbar', async () => {
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test('navigates to user edit page on edit button click', async () => {
        const editButton = screen.getByLabelText('edit-Jane Smith');
        await userEvent.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Jane Smith');
    });

    test.skip('paginates users correctly', () => {
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        expect(screen.getAllByRole('listitem').length).toBe(3); // All users fit on one page in this test
    });
});
