import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor

- doppelung keine Variable - 7
- setup

- 8 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -10
CleanCode: -40
Testumfang: 62,25
 */

// Mock the next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock fetch function
global.fetch = jest.fn();

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
];

const queryClient = new QueryClient();

const renderComponent = () => {
    render(
        <QueryClientProvider client={queryClient}>
            <UserEmployeeListSchwer />
        </QueryClientProvider>,
    );
};

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve(mockUsers),
            status: 200,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with initial state', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('User List')).toBeInTheDocument();
            expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
            expect(screen.getByText('Sort by')).toBeInTheDocument();
            expect(screen.getByText('Filter by Role')).toBeInTheDocument();
        });
    });

    it('should display users after fetching', async () => {
        renderComponent();

        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });
    });

    it('should filter users based on search term', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it.skip('should sort users by name and email', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('John Doe');
        });

        const emailSortRadio = screen.getByLabelText('Email');
        await user.click(emailSortRadio);

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Bob Johnson');
        });
    });

    it('should filter users by role', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByText('ADMIN'));

        await waitFor(() => {
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    it('should handle user deletion', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({}),
            status: 200,
        });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john@example.com', {
                method: 'POST',
            });
        });
    });

    it.skip('should handle pagination', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const nextPageButton = screen.getByRole('button', { name: 'Go to next page' });
        await user.click(nextPageButton);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it.skip('should display error message when fetching fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it.skip('should navigate to edit user page when edit button is clicked', async () => {
        const user = userEvent.setup();
        const mockPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
            push: mockPush,
        }));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });
});
