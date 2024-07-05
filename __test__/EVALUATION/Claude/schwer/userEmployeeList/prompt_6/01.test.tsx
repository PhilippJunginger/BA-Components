import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor


- doppelung keine Variable - 8
- setup

- 8 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -10
CleanCode: -45
Testumfang: 62,25
 */

// Mock the Next.js router
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

    it('should render the component with user list', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('User List')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });
    });

    it('should filter users based on search term', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should sort users by name and email', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        await user.click(emailRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Bob Johnson');

        await user.click(nameRadio);

        const updatedListItems = screen.getAllByRole('listitem');
        expect(updatedListItems[0]).toHaveTextContent('Bob Johnson');
    });

    it('should filter users by role', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByText('ADMIN'));

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should handle user deletion', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john@example.com', {
            method: 'POST',
        });
    });

    it.skip('should handle routing to edit user', async () => {
        const user = userEvent.setup();
        const routerPush = jest.fn();
        (require('next/router').useRouter as jest.Mock).mockReturnValue({ push: routerPush });

        renderComponent();

        await screen.findByText('John Doe');

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(routerPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it.skip('should handle pagination', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.getByRole('button', { name: 'page 2' })).toHaveAttribute('aria-current', 'true');
    });

    it.skip('should display error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('should display message when no users match search criteria', async () => {
        const user = userEvent.setup();
        renderComponent();

        await screen.findByText('John Doe');

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
