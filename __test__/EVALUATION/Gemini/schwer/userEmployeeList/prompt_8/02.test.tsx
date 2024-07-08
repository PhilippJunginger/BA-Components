import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- node access
- missing assertion

- variables - 5
- typeerror

- 6 von 12 notwendigem Testumfang erreicht + 3 Redudndanz


Best-Practices: -30
CleanCode: -30
Testumfang: 37,35
 */

// Mock data for testing
const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Peter Pan', email: 'peter.pan@example.com', role: USER_ROLE.EMPLOYEE },
];

// Mock fetch to return mock data
global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue(mockUsers),
});

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component with heading', async () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('fetches and displays users on mount', async () => {
        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters users based on search input', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findAllByRole('listitem');

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        // Only Jane Smith should be visible
        expect(screen.getByText('Jane Smith')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findAllByRole('listitem');

        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(screen.getByLabelText('Name', { selector: sortBySelect }));

        // Assert the order of the list items
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('John Doe'); // Should be first
        expect(listItems[1]).toHaveTextContent('Jane Smith');
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findAllByRole('listitem');

        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        // Only John Doe (Admin) should be visible
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('paginates users correctly', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findAllByRole('listitem');

        // Should only show the first 5 users initially
        expect(screen.getAllByRole('listitem')).toHaveLength(mockUsers.length);

        // Navigate to the next page
        const pagination = screen.getByRole('navigation');
        const nextPageButton = pagination.querySelector('button[aria-label="Go to next page"]');
        if (nextPageButton) {
            await userEvent.click(nextPageButton);
        }

        // Assert that the next page's users are displayed
    });

    it('deletes a user from the list', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findAllByRole('listitem');

        // Click the delete button for the first user (John Doe)
        const deleteButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(deleteButton);

        // Assert that the fetch call was made with the correct URL
        expect(fetch).toHaveBeenCalledWith(`http://localhost:8080/user?email=${mockUsers[0].email}`, {
            method: 'POST',
        });

        // After refetch, John Doe should not be in the document
        await screen.findByText('Jane Smith'); // Wait for re-render
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('shows an error message if deletion fails', async () => {
        // Mock fetch to throw an error for deletion
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Deletion failed'));

        render(<UserEmployeeListSchwer />);
        await screen.findAllByRole('listitem');

        // Click the delete button for any user
        const deleteButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(deleteButton);

        // Assert that the error snackbar is displayed
        expect(await screen.findByText('Deletion of user failed!')).toBeVisible();
    });

    it('navigates to the edit page when the edit button is clicked', async () => {
        // Mock useRouter to track route changes
        const mockPush = jest.fn();
        jest.mock('next/router', () => ({
            useRouter: () => ({ push: mockPush }),
        }));

        render(<UserEmployeeListSchwer />);
        await screen.findAllByRole('listitem');

        // Click the edit button for the first user (John Doe)
        const editButton = screen.getAllByLabelText(/edit/i)[0];
        await userEvent.click(editButton);

        // Assert that the router.push function was called with the correct path
        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });
});
