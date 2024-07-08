import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promise
- waitFor assertions

- import of wrong module - 2
- usage of module
- before* etc outside of describe
- variables

- 3 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -30
CleanCode: -25
Testumfang: 16,6
 */

// Sample user data
const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Brown', email: 'bob.brown@example.com', role: USER_ROLE.ADMIN },
];

// Mock server setup
const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(ctx.json(mockUsers));
    }),
    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        const email = req.url.searchParams.get('email');
        const userIndex = mockUsers.findIndex((u) => u.email === email);

        if (userIndex !== -1) {
            mockUsers.splice(userIndex, 1);
            return res(ctx.json({}));
        } else {
            return res(ctx.status(404));
        }
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer Component', () => {
    // Rendering tests
    it('renders the component with the correct title', async () => {
        render(<UserEmployeeListSchwer />);
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it('renders the user list with the correct items', async () => {
        render(<UserEmployeeListSchwer />);
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });
    });

    // Interaction tests
    it('filters the user list based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'alice');
        await waitFor(() => {
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    // ... similar tests for sorting, filtering by role, pagination

    // Test for deleting a user
    it('deletes a user from the list', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(async () => {
            expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(mockUsers.length);
            await userEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
        });

        await waitFor(() => {
            expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(mockUsers.length - 1);
        });
    });

    // Error Handling
    it('displays an error message if fetching users fails', async () => {
        server.use(
            rest.get('http://localhost:8080/users', (req, res, ctx) => {
                return res(ctx.status(500));
            }),
        );
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    // ... other test cases as needed (e.g., no users found, empty list)
});
