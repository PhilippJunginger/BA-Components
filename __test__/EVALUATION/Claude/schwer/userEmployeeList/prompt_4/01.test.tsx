import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup

- doppelung keine Variable - 7

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -30
CleanCode: -35
Testumfang: 70,55
 */

// Mock Next.js router
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
];

const queryClient = new QueryClient();

describe('UserEmployeeListSchwer', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            json: () => Promise.resolve(mockUsers),
        });
    });

    it('renders the component and fetches users', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        expect(screen.getByText('User List')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('filters users based on search term', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    it('filters users by role', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: 'EMPLOYEE' }));

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it.skip('handles user deletion', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({}),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john@example.com', {
                method: 'POST',
            });
        });
    });

    it.skip('handles user edit navigation', async () => {
        const mockPush = jest.fn();
        (require('next/router') as any).useRouter.mockReturnValue({ push: mockPush });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it.skip('handles pagination', async () => {
        const manyUsers = Array.from({ length: 10 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(manyUsers),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('User 1')).toBeInTheDocument();
        });

        expect(screen.getByText('User 5')).toBeInTheDocument();
        expect(screen.queryByText('User 6')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.getByText('User 6')).toBeInTheDocument();
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    });

    it.skip('displays error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays message when no users match the search', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays message when no users are created', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve([]),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });
});
