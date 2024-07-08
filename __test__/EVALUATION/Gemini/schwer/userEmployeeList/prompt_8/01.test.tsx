import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor assertions
- setup

- variables - 4

- 6 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -20
Testumfang: 41,5
 */

// Mock data for testing
const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Peter Pan', email: 'peter.pan@example.com', role: USER_ROLE.EMPLOYEE },
];

// Mock fetch function to return mock data
global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue(mockUsers),
});

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with title', async () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display all users initially', async () => {
        render(<UserEmployeeListSchwer />);
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeVisible();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(sortBySelect);
        await userEvent.click(screen.getByLabelText('Name'));
        await waitFor(() => {
            const userNames = screen.getAllByText(/^[A-Z]/).map((el) => el.textContent);
            expect(userNames).toEqual(['Jane Smith', 'John Doe', 'Peter Pan']);
        });
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });
        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText('EMPLOYEE'));
        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeVisible();
            expect(screen.getByText('Peter Pan')).toBeVisible();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('should handle user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john.doe@example.com', {
                method: 'POST',
            });
        });
    });

    it('should handle pagination', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        // Add assertions for pagination behavior if needed
    });

    it('should display a snackbar message on deletion failure', async () => {
        // Mock fetch to throw an error for deletion
        global.fetch = jest.fn().mockRejectedValue(new Error('Deletion failed'));
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeVisible();
        });
    });
});
