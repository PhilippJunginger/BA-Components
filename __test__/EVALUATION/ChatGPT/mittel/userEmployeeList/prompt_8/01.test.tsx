import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- render beforeEach

- unused import
- vairablen - 6
- typeerror

- 6 von 10 notwendigen Testfälen erreicht + 1 A + 1 Redundanz


Best-Practices: -10
CleanCode: -40
Testumfang: 55
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.ADMIN },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
    });

    it('should display the correct number of users', () => {
        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems).toHaveLength(mockUsers.length);
    });

    it('should filter users based on search term', async () => {
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await user.type(searchInput, 'Alice');
        expect(searchInput).toHaveValue('Alice');

        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        const radioName = screen.getByLabelText('Name');
        await user.click(radioName);

        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems[0]).toHaveTextContent('Alice');
        expect(userListItems[1]).toHaveTextContent('Bob');
        expect(userListItems[2]).toHaveTextContent('Charlie');
    });

    it('should sort users by email', async () => {
        const radioEmail = screen.getByLabelText('Email');
        await user.click(radioEmail);

        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems[0]).toHaveTextContent('Alice');
        expect(userListItems[1]).toHaveTextContent('Bob');
        expect(userListItems[2]).toHaveTextContent('Charlie');
    });

    it('should filter users by role', async () => {
        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: 'ADMIN' }));

        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should paginate users', async () => {
        const pagination = screen.getByRole('navigation');
        const nextPageButton = screen.getByRole('button', { name: /next page/i });

        await user.click(nextPageButton);

        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems).toHaveLength(0); // Assuming there are no more users on the next page
    });

    it('should remove user from list and show snackbar', async () => {
        const deleteButton = screen.getByLabelText('delete-Alice');
        await user.click(deleteButton);

        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems).toHaveLength(mockUsers.length - 1);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();

        const snackbar = screen.getByText('User removed successfully!');
        expect(snackbar).toBeInTheDocument();
    });

    it('should navigate to user edit page', async () => {
        const editButton = screen.getByLabelText('edit-Alice');
        await user.click(editButton);

        expect(mockRouter.push).toHaveBeenCalledWith('/edit/Alice');
    });
});
