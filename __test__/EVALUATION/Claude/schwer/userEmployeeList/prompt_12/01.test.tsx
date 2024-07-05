import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor
- prefer findBy

- setup
- doppelung keine Variable - 6

- 7 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -20
CleanCode: -35
Testumfang: 53,95
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
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('allows searching for users', async () => {
        renderComponent();
        const user = userEvent.setup();

        await screen.findByText('John Doe');

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('allows sorting users by name and email', async () => {
        renderComponent();
        const user = userEvent.setup();

        await screen.findByText('John Doe');

        const emailSortRadio = screen.getByLabelText('Email');
        await user.click(emailSortRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Bob Johnson');
        expect(listItems[1]).toHaveTextContent('Jane Smith');
        expect(listItems[2]).toHaveTextContent('John Doe');
    });

    it('allows filtering users by role', async () => {
        renderComponent();
        const user = userEvent.setup();

        await screen.findByText('John Doe');

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: 'EMPLOYEE' }));

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it.skip('handles user deletion', async () => {
        renderComponent();
        const user = userEvent.setup();

        await screen.findByText('John Doe');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({}),
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => expect(screen.queryByText('John Doe')).not.toBeInTheDocument());
    });

    it('handles pagination', async () => {
        const manyUsers = Array(10)
            .fill(null)
            .map((_, index) => ({
                name: `User ${index + 1}`,
                email: `user${index + 1}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(manyUsers),
        });

        renderComponent();
        const user = userEvent.setup();

        await screen.findByText('User 1');

        expect(screen.queryByText('User 6')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        expect(screen.getByText('User 6')).toBeInTheDocument();
    });

    it.skip('displays an error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it.skip('navigates to edit user page when edit button is clicked', async () => {
        renderComponent();
        const user = userEvent.setup();

        await screen.findByText('John Doe');

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(require('next/router').useRouter().push).toHaveBeenCalledWith('/edit/JohnDoe');
    });
});
