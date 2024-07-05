import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup

- doppelung keine Variable - 7


- 8 von 10 notwendigem Testumfang erreicht + 3 Redundant


Best-Practices: -10
CleanCode: -35
Testumfang: 65
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockImplementation(() => ({
    push: mockPush,
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
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders user list correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // 5 users per page
    });

    test('handles search functionality', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('handles sort functionality', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Alice Brown')).toBeInTheDocument();
    });

    test.skip('handles role filter functionality', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        const adminOption = screen.getByRole('option', { name: 'ADMIN' });
        await userEvent.click(adminOption);
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test.skip('handles pagination', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Eva Wilson')).toBeInTheDocument();
    });

    test.skip('handles user removal', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test.skip('handles routing to user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/John Doe');
    });

    test('displays info message when no users match search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonexistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays info message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('renders correct icons for user roles', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const adminIcons = screen.getAllByTestId('BadgeIcon');
        const employeeIcons = screen.getAllByTestId('SupervisorAccountIcon');
        expect(adminIcons).toHaveLength(2);
        expect(employeeIcons).toHaveLength(3);
    });

    test.skip('handles snackbar visibility and auto-hide', async () => {
        jest.useFakeTimers();
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
        jest.advanceTimersByTime(2000);
        await waitFor(() => {
            expect(screen.queryByText('User removed successfully!')).not.toBeInTheDocument();
        });
        jest.useRealTimers();
    });
});
