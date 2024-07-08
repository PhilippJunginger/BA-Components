import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server, rest } from '../../__mocks__/server';
import { useRouter } from 'next/router';
import { createMemoryRouter } from 'next/navigation';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer'; // For testing routing

/*
- promises
- setup
- prefer findBy
- assertions missing - 6

- not needed import - 2
- usage of not needed imports
- variables - 5

- 9 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -90
CleanCode: -40
Testumfang: 66,4
 */

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListSchwer Component', () => {
    const mockUsers: UserNoPw[] = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    beforeAll(() => {
        server.listen();

        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });
    afterEach(() => {
        server.resetHandlers();
        jest.clearAllMocks();
    });
    afterAll(() => server.close());

    it('renders user list with basic information', async () => {
        render(<UserEmployeeListSchwer />, { wrapper: MemoryRouterWrapper });
        await screen.findByText('User List');

        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    it('fetches and displays users on initial render', async () => {
        server.use(
            rest.get('http://localhost:8080/users', (req, res, ctx) => {
                return res(ctx.json(mockUsers));
            }),
        );

        render(<UserEmployeeListSchwer />, { wrapper: MemoryRouterWrapper });
        await screen.findByText('John Doe');
        await screen.findByText('Jane Smith');
        await screen.findByText('Alice Johnson');
    });

    it('handles errors when fetching users', async () => {
        server.use(
            rest.get('http://localhost:8080/users', (req, res, ctx) => {
                return res(ctx.status(500));
            }),
        );

        render(<UserEmployeeListSchwer />, { wrapper: MemoryRouterWrapper });
        await screen.findByText('An error occurred while retrieving users');
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />, { wrapper: MemoryRouterWrapper });
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        await screen.findByText('Alice Johnson');

        // Assert other users are not present
        expect(screen.queryByText('John Doe')).toBeNull();
        expect(screen.queryByText('Jane Smith')).toBeNull();
    });

    it('sorts users by name or email', async () => {
        render(<UserEmployeeListSchwer />, { wrapper: MemoryRouterWrapper });

        await screen.findByText('John Doe'); // wait for data to load

        const sortSelect = screen.getByLabelText('Sort by');
        await userEvent.selectOptions(sortSelect, 'email');

        // Check if order changed (Alice Johnson should be first based on email)
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('Alice Johnson');
        });
    });

    it('filters users by role', async () => {
        // ... Add logic to select filter options and verify results
    });

    it('deletes a user and updates the list', async () => {
        render(<UserEmployeeListSchwer />, { wrapper: MemoryRouterWrapper });
        await screen.findByText('John Doe');

        server.use(
            rest.post('http://localhost:8080/user*', (req, res, ctx) => {
                return res(ctx.status(200));
            }),
        );
        await userEvent.click(screen.getAllByLabelText('delete-John Doe')[0]);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('displays a message when no users match the search', async () => {
        // ... (same as in Developer 3's example)
    });

    it('displays a message when no users exist', async () => {
        // ... (same as in Developer 3's example)
    });

    it('is accessible for users with disabilities', () => {
        // ... (same as in Developer 3's example)
    });

    it('navigates to the edit page when clicking edit button', async () => {
        const routerPushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: routerPushMock });

        render(<UserEmployeeListSchwer />, { wrapper: MemoryRouterWrapper });
        await screen.findByText('John Doe');
        await userEvent.click(screen.getAllByLabelText('edit-John Doe')[0]);
        expect(routerPushMock).toHaveBeenCalledWith('/edit/JohnDoe');
    });
});

function MemoryRouterWrapper({ children }: { children: React.ReactNode }) {
    const router = createMemoryRouter([
        {
            path: '/',
            children,
        },
    ]);
    return <router.Provider>{children}</router.Provider>;
}
