import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';
import userEvent from '@testing-library/user-event';

/*
- setup
- fireEvent

- vairablen - 4
- unused import


- 4 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -25
Tetumfang: 35
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: UserNoPw[] = [
    { email: 'admin@example.com', name: 'Admin User', role: USER_ROLE.ADMIN },
    { email: 'employee@example.com', name: 'Employee User', role: USER_ROLE.EMPLOYEE },
    { email: 'customer@example.com', name: 'Customer User', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders user list correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        // Check if the component title and search bar are rendered
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();

        // Only admin and employee users should be displayed
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Employee User')).toBeInTheDocument();
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'employee');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Employee User')).toBeInTheDocument();
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleFilter = screen.getByLabelText('Filter by Role');
        fireEvent.change(roleFilter, { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it('sorts users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        // Sort by email (descending order)
        const sortBy = screen.getByLabelText('Sort by');
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);

        // Assert the order
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Employee User');
        expect(listItems[1]).toHaveTextContent('Admin User');
    });

    it('paginates users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={[...mockUsers, ...mockUsers]} />); // Double the users to test pagination

        // Check if pagination buttons are rendered
        expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();

        // Go to the next page
        await userEvent.click(screen.getByLabelText('Go to next page'));

        // Assert that the next set of users are displayed
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Employee User')).toBeInTheDocument();
    });

    // ... add more tests for deleting users, navigating to edit page, snackbar behavior etc.
});
