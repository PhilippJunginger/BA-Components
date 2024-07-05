import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup

- unused imports - 2
- doppelung keine Variable - 7


- 8 von 10 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: -10
CleanCode: -45
Testumfang: 70
 */

// Mock next/router
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

    test('renders component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    test('filters users by search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        await userEvent.click(nameRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Bob Johnson');
        expect(listItems[1]).toHaveTextContent('Jane Smith');
        expect(listItems[2]).toHaveTextContent('John Doe');
    });

    test('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('bob@example.com');
        expect(listItems[1]).toHaveTextContent('jane@example.com');
        expect(listItems[2]).toHaveTextContent('john@example.com');
    });

    test.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('removes user from list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test('navigates to edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-Jane Smith');
        await userEvent.click(editButton);
        expect(mockRouter.push).toHaveBeenCalledWith('/edit/Jane Smith');
    });

    test.skip('paginates users', async () => {
        const manyUsers = Array(15)
            .fill(null)
            .map((_, index) => ({
                name: `User ${index}`,
                email: `user${index}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));
        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);
        expect(screen.getByText('User 0')).toBeInTheDocument();
        expect(screen.queryByText('User 5')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);
        expect(screen.getByText('User 5')).toBeInTheDocument();
        expect(screen.queryByText('User 0')).not.toBeInTheDocument();
    });

    test('displays info message when no users match search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays info message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
