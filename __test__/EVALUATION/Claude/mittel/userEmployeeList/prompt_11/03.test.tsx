import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup

- doppelung keine Variable - 5

- 8 von 10 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: -10
CleanCode: -25
Testumfang: 70
 */

// Mock the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip('renders the component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('displays "no users available" message when fetchedUsers is empty', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it.skip('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        await userEvent.click(nameRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[2]).getByText('John Doe')).toBeInTheDocument();
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[2]).getByText('John Doe')).toBeInTheDocument();
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);
        expect(mockRouter.push).toHaveBeenCalledWith('/edit/John Doe');
    });

    it.skip('paginates the user list', async () => {
        const manyUsers = Array.from({ length: 12 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));
        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);
        expect(screen.getByText('User 6')).toBeInTheDocument();
    });

    it('displays "no users matching" message when filtered list is empty', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
