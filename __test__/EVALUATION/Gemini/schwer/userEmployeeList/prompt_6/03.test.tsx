import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor assertions
- node access

- variables - 3

- 2 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -15
Testumfang: 8,3
 */

describe('UserEmployeeListSchwer', () => {
    const user = userEvent.setup();

    // Mock fetch for consistent data in tests
    beforeEach(() => {
        const mockUsers = [
            { email: 'test@email.com', name: 'Test User', role: USER_ROLE.EMPLOYEE },
            { email: 'admin1@email.com', name: 'Admin User 1', role: USER_ROLE.ADMIN },
            { email: 'admin2@email.com', name: 'Admin User 2', role: USER_ROLE.ADMIN },
            { email: 'john@email.com', name: 'John Doe', role: USER_ROLE.EMPLOYEE },
            { email: 'jane@email.com', name: 'Jane Smith', role: USER_ROLE.EMPLOYEE },
        ];

        global.fetch = jest.fn().mockResolvedValue({
            json: async () => mockUsers,
            status: 200,
        });
    });

    it('should render user list title', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display users when fetchedUsers data is available', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('Test User');
        expect(screen.getByText('Test User').closest('li')).toBeInTheDocument();
    });

    it('should filter users by search term', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await user.type(searchInput, 'John');

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    it('should filter users by role and sort by email', async () => {
        render(<UserEmployeeListSchwer />);

        const roleFilter = screen.getByLabelText('Filter by Role');
        await user.selectOptions(roleFilter, USER_ROLE.ADMIN);

        const sortBySelect = screen.getByLabelText('Sort by');
        await user.selectOptions(sortBySelect, 'email');

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(2);
            expect(screen.getByText('admin1@email.com')).toBeInTheDocument();
            expect(screen.getByText('admin2@email.com')).toBeInTheDocument();
        });
    });

    // ... Additional tests for:
    // - Deleting users (click on delete button and verify behavior)
    // - Editing users (click on edit button and verify routing)
    // - Empty search results
    // - No users fetched
    // - Error states from fetch
    // - Pagination functionality
    // - Snackbar messages (appearing and disappearing)
});
