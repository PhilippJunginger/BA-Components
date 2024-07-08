import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- assertions waitFor

- variable - 3
- unnecessary waitFor - 6

- 6 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -10
CleanCode: -45
Testumfang: 45,65
 */

// Mock the fetch function
global.fetch = jest.fn() as jest.Mock;

describe('UserEmployeeListSchwer Component', () => {
    const user = userEvent.setup();
    const mockUsers: UserNoPw[] = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Bob Johnson', email: 'bob.johnson@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Alice Williams', email: 'alice.williams@example.com', role: USER_ROLE.ADMIN },
        { name: 'Charlie Brown', email: 'charlie.brown@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Eva Green', email: 'eva.green@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    beforeEach(() => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockUsers,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders user list with correct items', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'John');

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    it('sorts users by name or email', async () => {
        render(<UserEmployeeListSchwer />);
        const sortByNameRadio = screen.getByLabelText('Name');
        const sortByEmailRadio = screen.getByLabelText('Email');

        await user.click(sortByEmailRadio);
        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[0]).toHaveTextContent('Alice Williams');
        });

        await user.click(sortByNameRadio);
        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[0]).toHaveTextContent('Alice Williams');
        });
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const filterSelect = screen.getByLabelText('Filter by Role');
        await user.selectOptions(filterSelect, USER_ROLE.ADMIN);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    it('paginates users correctly', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(5); // Initial page size
        });

        const nextPageButton = screen.getByLabelText('Go to next page');
        await user.click(nextPageButton);

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(1); // Remaining users on the next page
        });
    });

    it('shows error message when fetching fails', async () => {
        (fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('shows "no users" message when no users match filter', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'NonexistentUser');

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    // Add more tests for delete user functionality, routing, and Snackbar messages
});
