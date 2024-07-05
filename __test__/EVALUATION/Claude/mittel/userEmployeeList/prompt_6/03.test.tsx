import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*


- doppelung keine Variable - 5
- enum


- 8 von 10 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: 0
CleanCode: -30
Testumfang: 75
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.ADMIN },
    { name: 'Alice Brown', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie Davis', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Eva Wilson', email: 'eva@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel', () => {
    const user = userEvent.setup();

    it.skip('renders the component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // 5 users per page
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        await user.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Alice Brown')).toBeInTheDocument();

        await user.click(nameRadio);
        const updatedListItems = screen.getAllByRole('listitem');
        expect(within(updatedListItems[0]).getByText('Alice Brown')).toBeInTheDocument();
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByText('ADMIN'));

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it.skip('paginates the user list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Eva Wilson')).toBeInTheDocument();
    });

    it.skip('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it.skip('navigates to edit user page', async () => {
        const mockPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
            push: mockPush,
        }));

        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/John Doe');
    });

    it('displays info message when no users match search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'NonexistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays info message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
