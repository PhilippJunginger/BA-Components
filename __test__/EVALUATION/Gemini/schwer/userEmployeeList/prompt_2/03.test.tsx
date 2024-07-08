import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking query and fetch
- missing assertions
- prefer findBy
- promise not handled
- waitFor assertions
- setup

- variable - 6
- unused import - 2
- unnecessary waitFor - 2
- missing import


- 5 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -60
CleanCode: -55
Testumfang: 37,35
 */

// Mock react-query to control the data fetching
jest.mock('@tanstack/react-query', () => ({
    useQuery: () => ({
        data: [
            { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
            { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
            { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
        ],
        isError: false,
        refetch: jest.fn().mockResolvedValue({
            data: [
                { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
                { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
            ],
        }),
    }),
}));

// Mock next/router to avoid navigation errors
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock fetch to control API responses
global.fetch = jest.fn().mockImplementation(async (url) => {
    if (url === 'http://localhost:8080/users') {
        return {
            status: 200,
            json: async () => [
                { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
                { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
                { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
            ],
        };
    } else if (url.startsWith('http://localhost:8080/user?email=')) {
        return {
            status: 200,
            json: async () => ({}),
        };
    }
    throw new Error(`Unhandled fetch URL: ${url}`);
});

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user list with correct data', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('Alice');

        // Check that employees (Alice, Bob) are displayed, but not the customer (Charlie)
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('Alice');

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'bob');

        // Only Bob should remain
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('sorts users by name or email', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('Alice');

        // Default sorting should be by name (Alice, Bob)
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice');
        expect(listItems[1]).toHaveTextContent('Bob');

        // Click on "Email" radio button
        await userEvent.click(screen.getByLabelText('Email'));

        // Sorting should change to email (alice@example.com, bob@example.com)
        await waitFor(() => {
            const updatedListItems = screen.getAllByRole('listitem');
            expect(updatedListItems[0]).toHaveTextContent('alice@example.com');
            expect(updatedListItems[1]).toHaveTextContent('bob@example.com');
        });
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('Alice');

        // Open the role filter dropdown
        await userEvent.click(screen.getByLabelText('Filter by Role'));

        // Select "EMPLOYEE" from the dropdown
        await userEvent.click(screen.getByText('EMPLOYEE'));

        // Only Bob (employee) should remain
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('handles user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('Alice');

        // Click the delete button for Alice
        await userEvent.click(screen.getAllByLabelText('delete-Alice')[0]);

        // Alice should be removed from the list
        await waitFor(() => expect(screen.queryByText('Alice')).not.toBeInTheDocument());

        // refetch should be called after successful deletion
        expect((refetch as jest.Mock).mock.calls.length).toBe(1);
    });

    it('handles failed user deletion', async () => {
        // Mock fetch to return an error for deletion
        (fetch as jest.Mock).mockImplementationOnce(() => ({
            status: 500,
            json: async () => ({ message: 'Error deleting user' }),
        }));

        render(<UserEmployeeListSchwer />);
        await screen.findByText('Alice');

        // Click the delete button for Alice
        await userEvent.click(screen.getAllByLabelText('delete-Alice')[0]);

        // Snackbar should show the error message
        await screen.findByText('Deletion of user failed!');
    });

    // ... (Add more tests for pagination, error handling, etc.)
});
