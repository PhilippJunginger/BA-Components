import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor

- setup
- doppelung keine Variable - 7

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -10
CleanCode: -40
Testumfang: 70,55
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
            status: 200,
            json: async () => mockUsers,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component and fetches users', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('User List')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });
    });

    it('allows searching for users', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('allows sorting users by name and email', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const emailSortRadio = screen.getByLabelText('Email');
        await user.click(emailSortRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Bob Johnson');
        expect(listItems[1]).toHaveTextContent('Jane Smith');
        expect(listItems[2]).toHaveTextContent('John Doe');
    });

    it('allows filtering users by role', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByText('ADMIN'));

        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it.skip('handles user deletion', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => ({}),
        });

        const deleteButton = screen.getAllByLabelText(/delete/i)[0];
        await user.click(deleteButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john@example.com', {
                method: 'POST',
            });
        });
    });

    it.skip('handles navigation to edit user', async () => {
        const user = userEvent.setup();
        const mockPush = jest.fn();
        (require('next/router') as any).useRouter.mockReturnValue({ push: mockPush });

        renderComponent();

        await screen.findByText('John Doe');

        const editButton = screen.getAllByLabelText(/edit/i)[0];
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it.skip('displays pagination and allows page changes', async () => {
        const user = userEvent.setup();
        const manyUsers = Array(20)
            .fill(null)
            .map((_, i) => ({
                name: `User ${i}`,
                email: `user${i}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => manyUsers,
        });

        renderComponent();

        await screen.findByText('User 0');

        expect(screen.getByText('User 0')).toBeInTheDocument();
        expect(screen.queryByText('User 5')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.queryByText('User 0')).not.toBeInTheDocument();
        expect(screen.getByText('User 5')).toBeInTheDocument();
    });

    it.skip('displays error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays message when no users match the search', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays message when no users are created', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => [],
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });
});
