import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*

- unused imports - 2
- doppelung keine Variable - 6


- 8 von 10 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: -10
CleanCode: -40
Testumfang: 70
 */

// Mock Next.js router
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
    { name: 'Alice Brown', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie Davis', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Eve Wilson', email: 'eve@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByText('Sort by')).toBeInTheDocument();
        expect(screen.getByText('Filter by Role')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // 5 users per page
    });

    test('filters users by search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('sorts users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        // Sort by name (default)
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice Brown');

        // Sort by email
        await userEvent.click(emailRadio);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('alice@example.com');

        // Sort by name again
        await userEvent.click(nameRadio);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice Brown');
    });

    test.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText('ADMIN'));
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test.skip('paginates users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Eve Wilson')).toBeInTheDocument();
    });

    test.skip('removes user from list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test.skip('routes to user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);
        expect(mockRouter.push).toHaveBeenCalledWith('/edit/John Doe');
    });

    test('displays info alert when no users match search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays info alert when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('displays correct icon for user role', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const adminIcons = screen.getAllByTestId('BadgeIcon');
        const employeeIcons = screen.getAllByTestId('SupervisorAccountIcon');
        expect(adminIcons).toHaveLength(2);
        expect(employeeIcons).toHaveLength(3);
    });
});
