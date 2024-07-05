import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup

- doppelung keine Variable - 6
- render FUnktion
- unused import
- enum


- 8 von 10 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: -10
CleanCode: -45
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
    { name: 'Charlie Davis', email: 'charlie@example.com', role: USER_ROLE.ADMIN },
    { name: 'Eva Wilson', email: 'eva@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip('renders the component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // 5 users per page
    });

    it('displays "no users available" message when fetchedUsers is empty', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
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

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');

        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText('ADMIN'));

        const listItems = screen.getAllByRole('listitem');
        listItems.forEach((item) => {
            expect(within(item).getByTestId('BadgeIcon')).toBeInTheDocument();
        });
    });

    it.skip('paginates the user list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);

        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Eva Wilson')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it.skip('navigates to edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(mockRouter.push).toHaveBeenCalledWith('/edit/John Doe');
    });

    it('displays "no users matching" message when search yields no results', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonexistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it.skip('clears snackbar message after timeout', async () => {
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
