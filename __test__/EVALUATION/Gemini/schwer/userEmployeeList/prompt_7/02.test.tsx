import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- mocking of wrong module
- waitFOr assertions

- unused const
- variables - 4

- 10 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -30
CleanCode: -25
Testumfang: 78,85
 */

// Mock data for users
const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jack Doe', email: 'jack.doe@example.com', role: USER_ROLE.EMPLOYEE },
];

// Mock fetch function to return users
jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
}));

global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue(mockUsers),
    status: 200,
});

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it('renders the component with user list', async () => {
        render(<UserEmployeeListSchwer />);

        // Check if the component renders
        expect(screen.getByText('User List')).toBeInTheDocument();

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
                expect(screen.getByText(user.email)).toBeVisible();
            });
        });
    });

    it('filters the user list by search term', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        });

        // Type a search term into the search input
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        // Check if the list is filtered correctly
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Jack Doe')).not.toBeInTheDocument();
    });

    it('sorts the user list by name or email', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        });

        // Sort by email
        const sortBySelect = screen.getByRole('radiogroup', { name: /Sort by/i });
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);

        // Check if the list is sorted by email
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('jane.doe@example.com');
        expect(userItems[1]).toHaveTextContent('john.doe@example.com');
        expect(userItems[2]).toHaveTextContent('jack.doe@example.com');

        // Sort by name
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);

        // Check if the list is sorted by name
        expect(userItems[0]).toHaveTextContent('Jack Doe');
        expect(userItems[1]).toHaveTextContent('Jane Doe');
        expect(userItems[2]).toHaveTextContent('John Doe');
    });

    it('filters the user list by role', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        });

        // Filter by employee role
        const filterSelect = screen.getByRole('combobox', { name: /Filter by Role/i });
        await userEvent.selectOptions(filterSelect, USER_ROLE.EMPLOYEE);

        // Check if the list is filtered correctly
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.getByText('Jack Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('paginates the user list correctly', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        });

        // Check if pagination is displayed
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeVisible();

        // Check if the correct number of pages is displayed
        const pageButtons = screen.getAllByRole('button', { name: /\d/ });
        expect(pageButtons).toHaveLength(1);
    });

    it('deletes a user from the list', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        });

        // Click the delete button for the first user
        const deleteButtons = screen.getAllByLabelText(/delete/i);
        await userEvent.click(deleteButtons[0]);

        // Wait for the user to be deleted and the list to update
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('navigates to the edit user page', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        });

        // Click the edit button for the first user
        const editButtons = screen.getAllByLabelText(/edit/i);
        await userEvent.click(editButtons[0]);
    });

    it('displays an error message if fetching users fails', async () => {
        // Mock fetch to throw an error
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));

        render(<UserEmployeeListSchwer />);

        // Check if the error message is displayed
        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeVisible();
        });
    });

    it('displays a message if no users are found', async () => {
        // Mock fetch to return an empty array
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue([]),
            status: 200,
        });

        render(<UserEmployeeListSchwer />);

        // Check if the message is displayed
        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeVisible();
        });
    });

    it('displays a message if no users match the search criteria', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        });

        // Type a search term that doesn't match any users
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');

        // Check if the message is displayed
        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeVisible();
        });
    });

    it('displays a snackbar message if user deletion fails', async () => {
        // Mock fetch to throw an error for deletion
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Deletion error'));

        render(<UserEmployeeListSchwer />);

        // Wait for the users to be fetched and rendered
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        });

        // Click the delete button for the first user
        const deleteButtons = screen.getAllByLabelText(/delete/i);
        await userEvent.click(deleteButtons[0]);

        // Check if the snackbar message is displayed
        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeVisible();
        });
    });
});
