import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
- vairablen - 5

- 6 von 10 notwendigen Testfälen erreicht + 1 + 1 Redundanz


Best-Practices: -30
CleanCode: -30
Testumfang: 55
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

    test('renders user list', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    test('search functionality works', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    test('sort by functionality works', async () => {
        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);
        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems[0]).toHaveTextContent('Alice');
        expect(userListItems[1]).toHaveTextContent('Bob');
        expect(userListItems[2]).toHaveTextContent('Charlie');
    });

    test.skip('filter by role functionality works', async () => {
        const filterSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    test('pagination works', () => {
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
    });

    test('edit button navigates to user page', async () => {
        const editButton = screen.getByLabelText('edit-Alice');
        await userEvent.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    test('delete button removes user from list and shows snackbar', async () => {
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });
});
