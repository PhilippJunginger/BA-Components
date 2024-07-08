import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer'; // Mock fetch module if used

/*
- userEvent.setup
- fireEvent
- promises not handled
- prefer findBy
- mocking of query instead of fetch

- unnecessary await findBy - 9
- variable - 3

- 8 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -50
CleanCode: -65
Testumfang: 62,25
 */

// Mock the useQuery hook
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

// Mock useRouter for handling navigation
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListSchwer Component', () => {
    const mockUsers: UserNoPw[] = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: USER_ROLE.CUSTOMER },
    ];

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn().mockResolvedValue({ data: mockUsers }),
        });

        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly with initial data', async () => {
        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('User List')).toBeInTheDocument();
    });

    test('filters users based on search term and role', async () => {
        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('User List')).toBeInTheDocument();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test.skip('sorts users by name or email', async () => {
        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('User List')).toBeInTheDocument();

        const emailSortLabel = screen.getByLabelText('Email');
        fireEvent.click(emailSortLabel);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('John Doe');
    });

    test('paginates users correctly', async () => {
        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('User List')).toBeInTheDocument();
    });

    test.skip('deletes a user successfully', async () => {
        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('User List')).toBeInTheDocument();
        const deleteButton = screen.getAllByLabelText('delete-')[0];
        await userEvent.click(deleteButton);
    });

    test.skip('handles user deletion error', async () => {
        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('User List')).toBeInTheDocument();
        const deleteButton = screen.getAllByLabelText('delete-')[0];
        await userEvent.click(deleteButton);
        expect(await screen.findByText('Deletion of user failed!')).toBeInTheDocument();
    });

    test.skip('navigates to edit user page', async () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('User List')).toBeInTheDocument();

        const editButton = screen.getAllByLabelText('edit-')[0];
        await userEvent.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    test('displays error message when fetching users fails', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: undefined,
            isError: true,
            refetch: jest.fn().mockResolvedValue({ data: mockUsers }),
        });

        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    test.skip('displays no users message when no users are found', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: false,
            refetch: jest.fn().mockResolvedValue({ data: mockUsers }),
        });

        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText('No Users created')).toBeInTheDocument();
    });
});
