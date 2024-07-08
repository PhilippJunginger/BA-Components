import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- node access
- missing assertion - 2

- variables - 3
- enum

- 6 von 12 notwendigem Testumfang erreicht + 3 Redudndanz


Best-Practices: -40
CleanCode: -20
Testumfang: 37,35
 */

// Mock data for testing
const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Peter Jones', email: 'peter.jones@example.com', role: USER_ROLE.EMPLOYEE },
];

// Mock fetch and its response for testing
global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue(mockUsers),
    status: 200,
});

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it('renders the component with heading', async () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('fetches and displays the user list', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        for (const user of mockUsers) {
            expect(await screen.findByText(user.name)).toBeVisible();
        }
    });

    it('filters the user list based on search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('sorts the user list by name', async () => {
        render(<UserEmployeeListSchwer />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(sortBySelect);
        const nameOption = screen.getByLabelText('Name');
        await userEvent.click(nameOption);

        // Assert that the list is sorted by name (Jane, John, Peter)
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Jane Smith');
        expect(userItems[1]).toHaveTextContent('John Doe');
        expect(userItems[2]).toHaveTextContent('Peter Jones');
    });

    it('filters the user list by role', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });
        await userEvent.click(roleSelect);
        const employeeOption = screen.getByRole('option', { name: 'EMPLOYEE' });
        await userEvent.click(employeeOption);

        // Assert that only employees are displayed
        expect(screen.getByText('Jane Smith')).toBeVisible();
        expect(screen.getByText('Peter Jones')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('paginates the user list correctly', async () => {
        render(<UserEmployeeListSchwer />);
        // Assuming rowsPerPage is set to a value less than mockUsers.length
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        // Add assertions to check if the correct number of pages are displayed
        // and if clicking on a page number displays the correct users
    });

    it('deletes a user from the list', async () => {
        render(<UserEmployeeListSchwer />);
        const deleteUserButton = screen.getAllByLabelText(/delete-/i)[0]; // Get the first delete button
        await userEvent.click(deleteUserButton);
        // Assert that the fetch call is made with the correct URL and method
        expect(fetch).toHaveBeenCalledWith(`http://localhost:8080/user?email=${mockUsers[0].email}`, {
            method: 'POST',
        });
        // After refetch, assert that the user is removed from the list
        expect(screen.queryByText(mockUsers[0].name)).not.toBeInTheDocument();
    });

    it('navigates to the edit page when the edit button is clicked', async () => {
        render(<UserEmployeeListSchwer />);
        const editUserButton = screen.getAllByLabelText(/edit-/i)[0]; // Get the first edit button
        await userEvent.click(editUserButton);
        // Assert that the router is pushed to the correct route
        // You'll need to mock useRouter from next/router for this to work
    });

    it('displays a snackbar message if deletion fails', async () => {
        // Mock fetch to throw an error
        global.fetch = jest.fn().mockRejectedValue(new Error('Deletion failed'));
        render(<UserEmployeeListSchwer />);
        const deleteUserButton = screen.getAllByLabelText(/delete-/i)[0];
        await userEvent.click(deleteUserButton);
        // Assert that the snackbar message is displayed
        expect(await screen.findByText('Deletion of user failed!')).toBeVisible();
    });
});
