import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor
- mocking query instead of fetch

- doppelung keine Variable - 6

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -20
CleanCode: -30
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
    const user = userEvent.setup();

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders the component with user list', async () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('allows searching for users', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'John');

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('allows sorting users by name and email', async () => {
        render(<UserEmployeeListSchwer />);

        await user.click(screen.getByLabelText('Email'));

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    it('allows filtering users by role', async () => {
        render(<UserEmployeeListSchwer />);

        await user.click(screen.getByLabelText('Filter by Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('handles user deletion', async () => {
        const mockRefetch = jest.fn().mockResolvedValue({ data: [mockUsers[1]] });
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });

        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({}),
        });

        render(<UserEmployeeListSchwer />);

        await user.click(screen.getByLabelText('delete-John Doe'));

        await waitFor(() => {
            expect(mockRefetch).toHaveBeenCalled();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('handles navigation to edit user', async () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        render(<UserEmployeeListSchwer />);

        await user.click(screen.getByLabelText('edit-John Doe'));

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('displays error message when fetching users fails', () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: null,
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('displays message when no users match the search', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('handles pagination', async () => {
        const manyUsers = Array(10)
            .fill(null)
            .map((_, i) => ({
                name: `User ${i}`,
                email: `user${i}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));

        (useQuery as jest.Mock).mockReturnValue({
            data: manyUsers,
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User 0')).toBeInTheDocument();
        expect(screen.queryByText('User 5')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

        expect(screen.queryByText('User 0')).not.toBeInTheDocument();
        expect(screen.getByText('User 5')).toBeInTheDocument();
    });
});
