import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor assertions
- mock of wrong query instead of fetch
- setup
- fireEvent

- vairablen - 6

- 9 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -30
Testumfang: 66,4
 */

jest.mock('@tanstack/react-query');
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('UserEmployeeListSchwer Component', () => {
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    beforeEach(() => {
        mockUseQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        } as any);

        mockUseRouter.mockReturnValue({
            push: jest.fn(),
        } as any);
    });

    it.skip('should render the component with initial state', () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText(USER_ROLE.ADMIN)).toBeInTheDocument();
        expect(screen.getByText(USER_ROLE.EMPLOYEE)).toBeInTheDocument();
    });

    it('should handle search input change', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListSchwer />);
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        await waitFor(() => {
            const sortedUsers = screen.getAllByRole('listitem');
            expect(sortedUsers[0]).toHaveTextContent('jane@example.com');
            expect(sortedUsers[1]).toHaveTextContent('john@example.com');
        });
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        fireEvent.mouseDown(roleSelect);
        const adminOption = await screen.findByText(USER_ROLE.ADMIN);
        fireEvent.click(adminOption);
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    it.skip('should handle page change', async () => {
        render(<UserEmployeeListSchwer />);
        const paginationButton = screen.getByRole('button', { name: '2' });
        await userEvent.click(paginationButton);
        await waitFor(() => {
            expect(paginationButton).toHaveAttribute('aria-current', 'true');
        });
    });

    it.skip('should handle user edit navigation', async () => {
        const mockPush = jest.fn();
        mockUseRouter.mockReturnValueOnce({ push: mockPush } as any);

        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    it('should handle user deletion with error', async () => {
        mockUseQuery.mockReturnValueOnce({
            data: mockUsers,
            isError: false,
            refetch: jest.fn().mockRejectedValue(new Error('Deletion failed')),
        } as any);

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-Jane Smith');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    it.skip('should show error message when fetch fails', async () => {
        mockUseQuery.mockReturnValueOnce({
            data: [],
            isError: true,
            refetch: jest.fn(),
        } as any);

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it.skip('should show no users created message', async () => {
        mockUseQuery.mockReturnValueOnce({
            data: [],
            isError: false,
            refetch: jest.fn(),
        } as any);

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });

    it('should show no matching users message', async () => {
        mockUseQuery.mockReturnValueOnce({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        } as any);

        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });
});
