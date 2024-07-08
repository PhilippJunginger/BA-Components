import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- setup
- fireEvent

- enum
- vairablen - 7

- 8 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -40
Testumfang: 70
 */

// Mock useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;

const mockPush = jest.fn();
mockedUseRouter.mockReturnValue({
    push: mockPush,
});

const fetchedUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Dave', email: 'dave@example.com', role: USER_ROLE.ADMIN },
    { name: 'Eve', email: 'eve@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Frank', email: 'frank@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    it('renders the component', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('displays users in the list', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('filters users by search term', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Alice' } });
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('sorts users by email', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);
        const firstUser = screen.getAllByRole('listitem')[0];
        expect(firstUser).toHaveTextContent('Alice');
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, 'ADMIN');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('removes a user from the list', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        fireEvent.click(deleteButton);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to user edit page on edit button click', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const editButton = screen.getByLabelText('edit-Alice');
        fireEvent.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    it('paginates users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        fireEvent.click(nextPageButton);
        expect(screen.getByText('Frank')).toBeInTheDocument();
    });

    it('displays no users alert if no users match the search criteria', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Z' } });
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays no users alert if there are no fetched users', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
