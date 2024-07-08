import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- fireEvent
- promises
- setup
- waitFor assertions

- not needed import - 2
- usage of not needed import
- variable - 4
- const missing
- test covering too different cases
- before* outside of describe

- 4 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -40
CleanCode: -50
Testumfang: 29,05
 */

// Mock data
const mockUsers: UserNoPw[] = [
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob Smith', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Carol Williams', email: 'carol@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'David Brown', email: 'david@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Eva Davis', email: 'eva@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Frank Miller', email: 'frank@example.com', role: USER_ROLE.ADMIN },
];

// Mock server
const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(ctx.json(mockUsers));
    }),
    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        const email = req.url.searchParams.get('email');
        const filteredUsers = mockUsers.filter((user) => user.email !== email);
        return res(ctx.json(filteredUsers));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer Component', () => {
    it('renders user list correctly', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            mockUsers.slice(0, rowsPerPage).forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });
    });

    it('filters and sorts users', async () => {
        render(<UserEmployeeListSchwer />);

        // Filter by role
        fireEvent.change(screen.getByLabelText('Filter by Role'), { target: { value: USER_ROLE.ADMIN } });
        await waitFor(() => {
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        });

        // Search by name
        fireEvent.change(screen.getByLabelText('Search Users'), { target: { value: 'alice' } });
        await waitFor(() => {
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        });

        // Sort by email (ascending)
        fireEvent.click(screen.getByLabelText('Email'));
        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[0]).toHaveTextContent('Alice Johnson'); // Alice's email is first alphabetically
        });
    });

    it('paginates user list', async () => {
        render(<UserEmployeeListSchwer />);

        // Initially, only the first 5 users should be visible
        await waitFor(() => {
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.queryByText('Frank Miller')).not.toBeInTheDocument(); // Frank is on the second page
        });

        // Go to the next page
        await userEvent.click(screen.getByLabelText('Go to next page'));
        await waitFor(() => {
            expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
            expect(screen.getByText('Frank Miller')).toBeInTheDocument();
        });
    });

    it('deletes a user', async () => {
        render(<UserEmployeeListSchwer />);

        // Delete Bob Smith (the second user)
        await userEvent.click(screen.getAllByLabelText('delete-Bob Smith')[0]);
        await waitFor(() => {
            expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        });
    });

    it('navigates to the user edit page', async () => {
        const mockRouterPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({ push: mockRouterPush } as any);

        render(<UserEmployeeListSchwer />);

        // Click the edit button for Alice Johnson
        await userEvent.click(screen.getAllByLabelText('edit-Alice Johnson')[0]);
        expect(mockRouterPush).toHaveBeenCalledWith('/edit/AliceJohnson');
    });
});
