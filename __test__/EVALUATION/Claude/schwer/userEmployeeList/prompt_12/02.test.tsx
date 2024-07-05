import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor
- mocking wrong module

- setup
- doppelung keine Variable - 6
- enum

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -20
CleanCode: -40
Testumfang: 70,55
 */

// Mock the dependencies
jest.mock('@tanstack/react-query');
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListSchwer', () => {
    const mockRefetch = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    it('renders the component with user list', async () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'John');

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        const nameRadio = screen.getByLabelText('Name');
        await user.click(nameRadio);

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[0]).toHaveTextContent('Jane Smith');
            expect(userItems[1]).toHaveTextContent('John Doe');
        });
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByText('ADMIN'));

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    it('handles user deletion', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({}),
        });

        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john@example.com', {
                method: 'POST',
            });
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('handles routing to edit user', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    it('displays error message when fetching users fails', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: null,
            isError: true,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays message when no users match the search', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    it('displays message when no users are created', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });

    it('handles pagination', async () => {
        const manyUsers = Array.from({ length: 10 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));

        (useQuery as jest.Mock).mockReturnValue({
            data: manyUsers,
            isError: false,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('User 1')).toBeInTheDocument();
            expect(screen.queryByText('User 6')).not.toBeInTheDocument();
        });

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        await waitFor(() => {
            expect(screen.queryByText('User 1')).not.toBeInTheDocument();
            expect(screen.getByText('User 6')).toBeInTheDocument();
        });
    });
});
