import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- waitFor
- setup

- doppelung keine Variable - 7

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -20
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
            json: () => Promise.resolve(mockUsers),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component and fetches users', async () => {
        renderComponent();
        expect(screen.getByText('User List')).toBeInTheDocument();
        await screen.findByText('John Doe');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it.skip('filters users based on search term', async () => {
        renderComponent();
        await screen.findByText('John Doe');

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
        });
    });

    it('sorts users by name and email', async () => {
        renderComponent();
        await screen.findByText('John Doe');

        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        await userEvent.click(emailRadio);
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('Bob Johnson');
            expect(listItems[1]).toHaveTextContent('Jane Smith');
            expect(listItems[2]).toHaveTextContent('John Doe');
        });

        await userEvent.click(nameRadio);
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('Bob Johnson');
            expect(listItems[1]).toHaveTextContent('Jane Smith');
            expect(listItems[2]).toHaveTextContent('John Doe');
        });
    });

    it.skip('filters users by role', async () => {
        renderComponent();
        await screen.findByText('John Doe');

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
        });
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

        renderComponent();
        await screen.findByText('User 1');

        expect(screen.getByText('User 5')).toBeInTheDocument();
        expect(screen.queryByText('User 6')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);

        await waitFor(() => {
            expect(screen.queryByText('User 5')).not.toBeInTheDocument();
            expect(screen.getByText('User 6')).toBeInTheDocument();
            expect(screen.getByText('User 10')).toBeInTheDocument();
        });
    });

    it('handles user deletion', async () => {
        renderComponent();
        await screen.findByText('John Doe');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({}),
        });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(mockUsers.slice(1)),
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        });
    });

    it('handles user edit navigation', async () => {
        const mockPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
            push: mockPush,
        }));

        renderComponent();
        await screen.findByText('John Doe');

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it.skip('displays error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays message when no users match the search', async () => {
        renderComponent();
        await screen.findByText('John Doe');

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    it('displays message when no users are created', async () => {
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
