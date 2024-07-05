import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor
- setup
- promises

- doppelung keine Variable - 5
- client in render Funkton

- 7 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -30
CleanCode: -30
Testumfang: 53,95
 */

// Mock the next/router
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
        });
    });

    it('allows searching for users', async () => {
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

    it('allows sorting users by name and email', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);

        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('Jane Smith');
            expect(listItems[1]).toHaveTextContent('John Doe');
        });
    });

    it('allows filtering users by role', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText('ADMIN'));

        await waitFor(() => {
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    it('handles user deletion', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john@example.com', {
                method: 'POST',
            });
        });
    });

    it('handles pagination', async () => {
        const manyUsers = Array.from({ length: 10 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
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

    it.skip('displays an error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays a message when no users are found', async () => {
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
