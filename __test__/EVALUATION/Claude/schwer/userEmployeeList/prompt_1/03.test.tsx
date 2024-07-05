import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- waitFor
- promise not handle

- doppelung keine Variable - 7
- query client in render Funktion

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -30
CleanCode: -40
Testumfang: 70,55
 */

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock fetch
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
            json: () => Promise.resolve(mockUsers),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders component and fetches users', async () => {
        renderComponent();
        expect(screen.getByText('User List')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });
    });

    test('filters users by search term', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test.skip('sorts users by name and email', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('John Doe');
        });

        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Bob Johnson');
        });
    });

    test('filters users by role', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText('ADMIN'));

        await waitFor(() => {
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    test('handles user deletion', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({}),
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john@example.com', {
                method: 'POST',
            });
        });
    });

    test.skip('handles user edit navigation', async () => {
        const { push } = require('next/router').useRouter();
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(push).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    test('handles pagination', async () => {
        const manyUsers = Array(10)
            .fill(null)
            .map((_, index) => ({
                name: `User ${index}`,
                email: `user${index}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(manyUsers),
        });

        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('User 0')).toBeInTheDocument();
            expect(screen.queryByText('User 5')).not.toBeInTheDocument();
        });

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);

        await waitFor(() => {
            expect(screen.queryByText('User 0')).not.toBeInTheDocument();
            expect(screen.getByText('User 5')).toBeInTheDocument();
        });
    });

    test.skip('displays error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    test('displays message when no users match search', async () => {
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

    test('displays message when no users are created', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve([]),
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });
});
