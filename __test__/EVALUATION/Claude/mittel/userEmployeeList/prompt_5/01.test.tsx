import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup

- doppelung keine Variable - 8
- render Funktion

- 7 von 10 notwendigem Testumfang erreicht + 1 A + 4 Redundant


Best-Practices: -10
CleanCode: -45
Testumfang: 50
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
    const renderComponent = (users = mockUsers) => {
        return render(<UserEmployeeListMittel fetchedUsers={users} />);
    };

    it.skip('renders the component with user list', () => {
        renderComponent();
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // 5 users per page
    });

    it('displays empty state message when no users are available', () => {
        renderComponent([]);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('filters users based on search term', async () => {
        renderComponent();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        renderComponent();
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

    it.skip('filters users by role', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText('ADMIN'));

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
        listItems.forEach((item) => {
            expect(within(item).getByTestId('BadgeIcon')).toBeInTheDocument();
        });
    });

    it.skip('paginates the user list', async () => {
        renderComponent();
        const pagination = screen.getByRole('navigation');
        expect(within(pagination).getByText('1')).toHaveAttribute('aria-current', 'true');

        await userEvent.click(within(pagination).getByText('2'));
        expect(within(pagination).getByText('2')).toHaveAttribute('aria-current', 'true');
        expect(screen.getByText('Eva Wilson')).toBeInTheDocument();
    });

    it.skip('removes a user from the list', async () => {
        renderComponent();
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it.skip('navigates to edit user page', async () => {
        const mockPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
            push: mockPush,
        }));

        renderComponent();
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/John Doe');
    });

    it('displays correct icons for user roles', () => {
        renderComponent();
        const adminIcon = screen.getAllByTestId('BadgeIcon')[0];
        const employeeIcon = screen.getAllByTestId('SupervisorAccountIcon')[0];

        expect(adminIcon).toBeInTheDocument();
        expect(employeeIcon).toBeInTheDocument();
    });

    it('handles edge case: no users match search criteria', async () => {
        renderComponent();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonexistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it.skip('resets page to 1 when changing filters', async () => {
        renderComponent();
        const pagination = screen.getByRole('navigation');
        await userEvent.click(within(pagination).getByText('2'));

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');

        expect(within(pagination).getByText('1')).toHaveAttribute('aria-current', 'true');
    });

    it.skip('closes snackbar after timeout', async () => {
        jest.useFakeTimers();
        renderComponent();
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
