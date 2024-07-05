import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor
- mocking wrong module

- doppelung keine Variable - 7

- 9 von 12 notwendigem Testumfang erreicht + 1 A + 1 Redundant


Best-Practices: -20
CleanCode: -35
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

    it('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'John');

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListSchwer />);

        const nameRadio = screen.getByLabelText('Name');
        await user.click(nameRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListSchwer />);

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('navigates to edit user page when edit button is clicked', async () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('removes user when delete button is clicked', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({}),
        });

        const mockRefetch = jest.fn().mockResolvedValue({ data: [mockUsers[1]] });
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('displays error message when fetching users fails', async () => {
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

    it('displays message when no users are created', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    it('paginates users correctly', async () => {
        const manyUsers = Array.from({ length: 7 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));

        (useQuery as jest.Mock).mockReturnValue({
            data: manyUsers,
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(screen.getByText('User 5')).toBeInTheDocument();
        expect(screen.queryByText('User 6')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.getByText('User 6')).toBeInTheDocument();
        expect(screen.getByText('User 7')).toBeInTheDocument();
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    });
});
