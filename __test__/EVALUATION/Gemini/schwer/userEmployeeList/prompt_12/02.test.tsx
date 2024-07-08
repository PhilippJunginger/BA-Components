import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup

- before* etc outside of describe
- varaible - 3

- 7 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -10
CleanCode: -20
Testumfang: 49,8
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Peter Jones', email: 'peter.jones@example.com', role: USER_ROLE.ADMIN },
];

// Mock fetch and its response for different scenarios
beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url) => {
        switch (url) {
            case 'http://localhost:8080/users':
                return Promise.resolve({
                    status: 200,
                    json: () => Promise.resolve(mockUsers),
                });
            case 'http://localhost:8080/user?email=john.doe@example.com':
                return Promise.resolve({
                    status: 200,
                    json: () => Promise.resolve({ message: 'User deleted successfully' }),
                });
            default:
                return Promise.reject(new Error('Invalid fetch url'));
        }
    });
});

describe('UserEmployeeListSchwer Component', () => {
    it('should render user list correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(mockUsers.length);
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        await userEvent.click(screen.getByLabelText('Name'));
        expect(sortBySelect).toHaveValue('name');
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems[0]).toHaveTextContent('Jane Smith');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const filterSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(2);
    });

    it('should handle user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        const deleteButton = await screen.findByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('should handle pagination correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeVisible();
        // Add more assertions for pagination behavior if needed
    });

    it('should display error message when fetching users fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch users'));
        render(<UserEmployeeListSchwer />);
        const errorMessage = await screen.findByText('An error occurred while retrieving users');
        expect(errorMessage).toBeVisible();
    });

    it('should display a message when no users are found', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve([]),
        });
        render(<UserEmployeeListSchwer />);
        const message = await screen.findByText('No Users created');
        expect(message).toBeVisible();
    });

    it('should display a snackbar message when user deletion fails', async () => {
        global.fetch = jest.fn().mockImplementation((url) => {
            if (url === 'http://localhost:8080/user?email=john.doe@example.com') {
                return Promise.resolve({
                    status: 500,
                    json: () => Promise.resolve({ message: 'Failed to delete user' }),
                });
            }
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(mockUsers),
            });
        });

        render(<UserEmployeeListSchwer />);
        const deleteButton = await screen.findByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        const snackbar = await screen.findByRole('alert');
        expect(snackbar).toBeVisible();
        expect(snackbar).toHaveTextContent('Deletion of user failed!');
    });
});
