import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup


- enum
- doppelung keine Variable - 6
- unused import


- 9 von 10 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: -10
CleanCode: -40
Testumfang: 80
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
};

// Sample user data
const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.ADMIN },
    { name: 'David', email: 'david@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Eve', email: 'eve@example.com', role: USER_ROLE.ADMIN },
    { name: 'Frank', email: 'frank@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    afterEach(() => {
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
        await userEvent.type(searchInput, 'alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        // Sort by name (default)
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice');

        // Sort by email
        await userEvent.click(emailRadio);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('alice@example.com');

        // Sort by name again
        await userEvent.click(nameRadio);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice');
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');

        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText('ADMIN'));

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
        listItems.forEach((item) => {
            expect(within(item).getByTestId('BadgeIcon')).toBeInTheDocument();
        });
    });

    it.skip('paginates users correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);

        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Frank')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);

        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-Alice');
        await userEvent.click(editButton);

        expect(mockRouter.push).toHaveBeenCalledWith('/edit/Alice');
    });

    it('displays "no users matching" message when search yields no results', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonexistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('does not display customer users', () => {
        const usersWithCustomer = [
            ...mockUsers,
            { name: 'Customer', email: 'customer@example.com', role: USER_ROLE.CUSTOMER },
        ];
        render(<UserEmployeeListMittel fetchedUsers={usersWithCustomer} />);
        expect(screen.queryByText('Customer')).not.toBeInTheDocument();
    });

    it.skip('auto-hides snackbar message after 2 seconds', async () => {
        jest.useFakeTimers();
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);

        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();

        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(screen.queryByText('User removed successfully!')).not.toBeInTheDocument();
        });

        jest.useRealTimers();
    });
});
