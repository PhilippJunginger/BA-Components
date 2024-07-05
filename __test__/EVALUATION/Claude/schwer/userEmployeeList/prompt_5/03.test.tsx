import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- waitFor
- promises not handled


- doppelung keine Variable - 7
- query client in render
- typeerror

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -30
CleanCode: -45
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

const renderComponent = () => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <UserEmployeeListSchwer />
        </QueryClientProvider>,
    );
};

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue(mockUsers),
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

    it('filters users based on search term', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
        });
    });

    it('sorts users by name and email', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);

        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('Bob Johnson');
            expect(listItems[1]).toHaveTextContent('Jane Smith');
            expect(listItems[2]).toHaveTextContent('John Doe');
        });
    });

    it.skip('filters users by role', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
        });
    });

    it('paginates the user list', async () => {
        const manyUsers = Array(10)
            .fill(null)
            .map((_, index) => ({
                name: `User ${index + 1}`,
                email: `user${index + 1}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: jest.fn().mockResolvedValue(manyUsers),
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('User 1')).toBeInTheDocument();
        });

        expect(screen.queryByText('User 6')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);

        await waitFor(() => {
            expect(screen.getByText('User 6')).toBeInTheDocument();
            expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        });
    });

    it('handles user deletion', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: jest.fn().mockResolvedValue({ message: 'User deleted' }),
        });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: jest.fn().mockResolvedValue(mockUsers.slice(1)),
        });

        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it.skip('handles routing to edit user', async () => {
        const mockPush = jest.fn();
        (require('next/router') as jest.Mocked<typeof import('next/router')>).useRouter.mockReturnValue({
            push: mockPush,
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it.skip('displays error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays message when no users match the search', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    it('displays message when no users are created', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: jest.fn().mockResolvedValue([]),
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });
});
