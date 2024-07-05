import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- waitFor

- doppelung keine Variable - 6

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -20
CleanCode: -30
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
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
];

const queryClient = new QueryClient();

const renderComponent = () =>
    render(
        <QueryClientProvider client={queryClient}>
            <UserEmployeeListSchwer />
        </QueryClientProvider>,
    );

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            json: async () => mockUsers,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component and fetches users', async () => {
        renderComponent();

        expect(screen.getByText('User List')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        });
    });

    it('allows searching for users', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it.skip('allows sorting users by name and email', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByRole('listitem').length).toBe(3);
        });

        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Bob Johnson');
        expect(listItems[1]).toHaveTextContent('Jane Smith');
        expect(listItems[2]).toHaveTextContent('John Doe');
    });

    it.skip('allows filtering users by role', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByRole('listitem').length).toBe(3);
        });

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText('EMPLOYEE'));

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it.skip('handles pagination correctly', async () => {
        const manyUsers = Array(10)
            .fill(null)
            .map((_, index) => ({
                name: `User ${index + 1}`,
                email: `user${index + 1}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));

        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            json: async () => manyUsers,
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByRole('listitem').length).toBe(5);
        });

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);

        expect(screen.getByText('User 6')).toBeInTheDocument();
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    });

    it.skip('allows editing a user', async () => {
        const mockRouterPush = jest.fn();
        (require('next/router') as any).useRouter.mockReturnValue({ push: mockRouterPush });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(mockRouterPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it.skip('allows deleting a user', async () => {
        (global.fetch as jest.Mock).mockImplementation((url, options) => {
            if (options && options.method === 'POST') {
                return Promise.resolve({
                    status: 200,
                    json: async () => ({}),
                });
            }
            return Promise.resolve({
                status: 200,
                json: async () => mockUsers.filter((user) => user.email !== 'john@example.com'),
            });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it.skip('displays an error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays a message when no users match the search', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays a message when no users are created', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            json: async () => [],
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });
});
