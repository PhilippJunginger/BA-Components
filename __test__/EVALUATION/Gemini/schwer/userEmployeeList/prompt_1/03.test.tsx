import { render, screen, act, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- userEvent.setup
- promises not handled
- mocking of query instead of fetch

- query provider unnecessary
- useQuery mock not in beforeEach
- variable - 2
- overly complicated tests - 2
- unused import - 2

- 5 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -30
CleanCode: -40
Testumfang: 37,35
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const queryClient = new QueryClient();
const useRouter = jest.requireMock('next/router');

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        useRouter.useRouter.mockImplementation(() => ({
            push: jest.fn(),
        }));
    });

    it('renders loading state while fetching data', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isError: false,
            refetch: jest.fn(),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('renders error message if fetching fails', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isError: true,
            refetch: jest.fn(),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('renders no users message if no users are created', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });

    it('renders and filters the user list', async () => {
        const users = [
            { name: 'John Doe', email: 'johndoe@example.com', role: USER_ROLE.ADMIN },
            { name: 'Jane Smith', email: 'janesmith@example.com', role: USER_ROLE.EMPLOYEE },
            { name: 'Alice Johnson', email: 'alicejohnson@example.com', role: USER_ROLE.CUSTOMER },
        ];
        (useQuery as jest.Mock).mockReturnValue({
            data: users,
            isError: false,
            refetch: jest.fn(),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        // Initially, only non-customer users should be visible
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();

        // Filter by name
        await userEvent.type(screen.getByLabelText('Search Users'), 'John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();

        // Filter by role
        await userEvent.selectOptions(screen.getByLabelText('Filter by Role'), USER_ROLE.ADMIN);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('paginates the user list', async () => {
        const users = Array.from({ length: 10 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: i % 2 === 0 ? USER_ROLE.ADMIN : USER_ROLE.EMPLOYEE,
        }));
        (useQuery as jest.Mock).mockReturnValue({
            data: users,
            isError: false,
            refetch: jest.fn(),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        // Initially, only the first 5 users should be visible
        for (let i = 0; i < 5; i++) {
            expect(screen.getByText(`User ${i + 1}`)).toBeInTheDocument();
        }
        for (let i = 5; i < 10; i++) {
            expect(screen.queryByText(`User ${i + 1}`)).not.toBeInTheDocument();
        }

        // Navigate to the next page
        await userEvent.click(screen.getByLabelText('Go to next page'));
        // Now the next 5 users should be visible
        for (let i = 5; i < 10; i++) {
            expect(screen.getByText(`User ${i + 1}`)).toBeInTheDocument();
        }
        for (let i = 0; i < 5; i++) {
            expect(screen.queryByText(`User ${i + 1}`)).not.toBeInTheDocument();
        }
    });

    it('handles user actions (edit, delete)', async () => {
        const users = [
            { name: 'John Doe', email: 'johndoe@example.com', role: USER_ROLE.ADMIN },
            { name: 'Jane Smith', email: 'janesmith@example.com', role: USER_ROLE.EMPLOYEE },
        ];
        const refetchMock = jest.fn();
        (useQuery as jest.Mock).mockReturnValue({
            data: users,
            isError: false,
            refetch: refetchMock,
        });

        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );

        // Edit user
        await userEvent.click(screen.getAllByLabelText('edit-John Doe')[0]);
        expect(useRouter().push).toHaveBeenCalledWith('/edit/JohnDoe');

        // Delete user (success)
        refetchMock.mockResolvedValueOnce({ data: [users[1]] });
        await userEvent.click(screen.getAllByLabelText('delete-John Doe')[0]);
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });

        // Delete user (failure)
        refetchMock.mockRejectedValueOnce(new Error('Deletion failed'));
        await userEvent.click(screen.getAllByLabelText('delete-Jane Smith')[0]);
        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });
});
