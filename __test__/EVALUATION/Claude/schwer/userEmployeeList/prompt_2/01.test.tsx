import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor

- doppelung keine Variable - 7
- setup

- 9 von 12 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: -10
CleanCode: -40
Testumfang: 70,55
 */

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
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
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('filters users based on search term', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const emailSortRadio = screen.getByLabelText('Email');
        await user.click(emailSortRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    it('filters users by role', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: 'EMPLOYEE' }));

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it.skip('handles pagination', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            json: () => Promise.resolve(Array(10).fill(mockUsers[0])),
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(5);
        });

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });

    it.skip('handles user deletion', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText('delete-John Doe');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({}),
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve([mockUsers[1]]),
        });

        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it.skip('handles user edit navigation', async () => {
        const user = userEvent.setup();
        const mockPush = jest.fn();
        (require('next/router') as any).useRouter.mockReturnValue({ push: mockPush });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it.skip('displays error alert when fetching users fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('displays info alert when no users match the search', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays info alert when no users are created', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            status: 200,
            json: () => Promise.resolve([]),
        });
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });
});
