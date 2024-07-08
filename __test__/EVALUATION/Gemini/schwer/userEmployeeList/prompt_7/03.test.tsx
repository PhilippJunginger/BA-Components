import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- mocking of wrong module
- waitFOr assertions
- node access

- unused const
- variables - 7

- 9 von 12 notwendigem Testumfang erreicht + 3 Redudndanz


Best-Practices: -40
CleanCode: -40
Testumfang: 62,25
 */

// Mock data for users
const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jack Doe', email: 'jack.doe@example.com', role: USER_ROLE.EMPLOYEE },
    {
        name: 'Richard Roe',
        email: 'richard.roe@example.com',
        role: USER_ROLE.ADMIN,
    },
    {
        name: 'Jane Roe',
        email: 'jane.roe@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        name: 'Jack Roe',
        email: 'jack.roe@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
];

// Mock fetch function to return mock users
jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}));

global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(mockUsers),
});

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        // Reset fetch mock before each test
        jest.clearAllMocks();
    });

    it('renders the component with the correct title', async () => {
        render(<UserEmployeeListSchwer />);
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it('fetches and displays the list of users', async () => {
        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        // Check if the correct number of users is displayed
        const listItemElements = screen.getAllByRole('listitem');
        expect(listItemElements).toHaveLength(rowsPerPage);
    });

    it('filters the user list based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');

        // Enter a search term
        await userEvent.type(searchInput, 'john');

        // Wait for the list to be filtered
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(1);
        });

        // Check if the correct user is displayed
        expect(screen.getByText('john.doe@example.com')).toBeVisible();
    });

    it('sorts the user list by name', async () => {
        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        // Get the sort by select element
        const sortBySelect = screen.getByRole('radiogroup', {
            name: /sort by/i,
        });

        // Select "Name" from the sort by options
        await userEvent.click(sortBySelect.querySelector('input[value="name"]') as HTMLElement);

        // Wait for the list to be sorted
        await waitFor(() => {
            const listItemElements = screen.getAllByRole('listitem');
            expect(listItemElements[0]).toHaveTextContent('Jack Doe');
            expect(listItemElements[1]).toHaveTextContent('Jack Roe');
            expect(listItemElements[2]).toHaveTextContent('Jane Doe');
        });
    });

    it('sorts the user list by email', async () => {
        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        // Get the sort by select element
        const sortBySelect = screen.getByRole('radiogroup', {
            name: /sort by/i,
        });

        // Select "Email" from the sort by options
        await userEvent.click(sortBySelect.querySelector('input[value="email"]') as HTMLElement);

        // Wait for the list to be sorted
        await waitFor(() => {
            const listItemElements = screen.getAllByRole('listitem');
            expect(listItemElements[0]).toHaveTextContent('jane.doe@example.com');
            expect(listItemElements[1]).toHaveTextContent('jane.roe@example.com');
            expect(listItemElements[2]).toHaveTextContent('jack.doe@example.com');
        });
    });

    it('filters the user list by role', async () => {
        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        // Get the filter by role select element
        const filterByRoleSelect = screen.getByRole('combobox', {
            name: /filter by role/i,
        });

        // Select "ADMIN" from the filter by role options
        await userEvent.selectOptions(filterByRoleSelect, 'ADMIN');

        // Wait for the list to be filtered
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(2);
        });

        // Check if only ADMIN users are displayed
        expect(screen.getByText('john.doe@example.com')).toBeVisible();
        expect(screen.getByText('richard.roe@example.com')).toBeVisible();
    });

    it('paginates the user list correctly', async () => {
        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        // Check if the first page is displayed
        expect(screen.getByText('John Doe')).toBeVisible();

        // Navigate to the next page
        const nextPageButton = screen.getByRole('button', { name: /go to next page/i });
        await userEvent.click(nextPageButton);

        // Wait for the next page to load
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });

        // Check if the second page is displayed
        expect(screen.getByText('Jane Roe')).toBeVisible();
    });

    it('displays a message when no users match the search criteria', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');

        // Enter a search term that does not match any user
        await userEvent.type(searchInput, 'nonexistentuser');

        // Wait for the "no users" message to be displayed
        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeVisible();
        });
    });

    it('displays a message when there are no users', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve([]),
        });

        render(<UserEmployeeListSchwer />);

        // Wait for the "no users" message to be displayed
        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeVisible();
        });
    });

    it('handles user deletion', async () => {
        // Mock the fetch function for deleting a user
        (fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
            if (options?.method === 'POST' && url.includes('/user?email=john.doe@example.com')) {
                return Promise.resolve({
                    status: 200,
                    json: () => Promise.resolve({}),
                });
            }
            return Promise.reject(new Error('Invalid request'));
        });

        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        // Click the delete button for John Doe
        const deleteButton = screen.getByRole('button', {
            name: /delete-John Doe/i,
        });
        await userEvent.click(deleteButton);

        // Wait for the user to be deleted and the list to update
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('handles errors during user deletion', async () => {
        // Mock the fetch function to throw an error during deletion
        (fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
            if (options?.method === 'POST' && url.includes('/user?email=john.doe@example.com')) {
                return Promise.reject(new Error('Failed to delete user'));
            }
            return Promise.reject(new Error('Invalid request'));
        });

        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        // Click the delete button for John Doe
        const deleteButton = screen.getByRole('button', {
            name: /delete-John Doe/i,
        });
        await userEvent.click(deleteButton);

        // Wait for the error snackbar to be displayed
        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeVisible();
        });
    });

    it('navigates to the edit user page', async () => {
        const mockRouterPush = jest.fn();
        jest.mock('next/navigation', () => ({
            useRouter: jest.fn().mockReturnValue({ push: mockRouterPush }),
        }));

        render(<UserEmployeeListSchwer />);
        // Wait for the users to be fetched and rendered
        await screen.findAllByRole('listitem');

        // Click the edit button for John Doe
        const editButton = screen.getByRole('button', { name: /edit-John Doe/i });
        await userEvent.click(editButton);

        // Check if the router.push function is called with the correct path
        expect(mockRouterPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });
});
