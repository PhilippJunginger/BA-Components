import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor
- mocking iof query instead of fetch

- setup
- doppelung keine Variable - 5

- 10 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -20
CleanCode: -30
Testumfang: 78,85
 */

// Mock the next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock the @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock) = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockUsers),
                status: 200,
            }),
        ) as jest.Mock;
    });

    it('renders the component with initial state', async () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    it('displays users when data is fetched successfully', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('John Doe');
        });

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Bob Johnson');
        });
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByText('ADMIN'));

        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john@example.com', { method: 'POST' });
        });
    });

    it('handles navigation to user edit page', async () => {
        const mockPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
            push: mockPush,
        }));

        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('displays pagination and changes page', async () => {
        const manyUsers = Array(10)
            .fill(null)
            .map((_, index) => ({
                name: `User ${index}`,
                email: `user${index}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve(manyUsers),
            status: 200,
        });

        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('User 0')).toBeInTheDocument();
        });

        expect(screen.queryByText('User 5')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.queryByText('User 0')).not.toBeInTheDocument();
        expect(screen.getByText('User 5')).toBeInTheDocument();
    });

    it('displays error message when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays message when no users match the search', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays message when no users are created', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve([]),
            status: 200,
        });

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });
});
