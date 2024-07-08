import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // for extended matchers like toHaveTextContent
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';
import userEvent from '@testing-library/user-event';

/*
- fireEvent
- promises

- vairablen - 3
- unused import
- setup


- 3 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -25
Tetumfang: 25
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListMittel Component', () => {
    const mockFetchedUsers: UserNoPw[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Alice Williams', email: 'alice@example.com', role: USER_ROLE.CUSTOMER }, // Should be filtered out
    ];

    const setup = () => {
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() }); // Mock router.push
        render(<UserEmployeeListMittel fetchedUsers={mockFetchedUsers} />);
    };

    beforeEach(() => {
        setup();
    });

    it('renders user list with correct items', () => {
        // Check for visible users (excluding the customer)
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Alice Williams')).not.toBeInTheDocument(); // Customer filtered out
    });

    it('filters users by search term', async () => {
        const user = userEvent.setup();
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        // Only Jane should be visible
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it.skip('sorts users by name or email', async () => {
        // Test sorting by email (ascending, then descending)
        fireEvent.click(screen.getByLabelText('Email')); // Click radio button
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('John Doe'); // John comes first alphabetically by email

        fireEvent.click(screen.getByLabelText('Email')); // Click again to reverse order
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Bob Johnson'); // Bob comes last alphabetically by email
    });

    // ... similar tests for filtering by role, pagination, deleting users,
    // clicking edit button (checking router.push), snackbar message

    it.skip('shows alerts when there are no users', async () => {
        // Test with no fetched users
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();

        // Test with fetched users but none matching filter
        render(<UserEmployeeListMittel fetchedUsers={mockFetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser'); // Search for non-existent user
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
