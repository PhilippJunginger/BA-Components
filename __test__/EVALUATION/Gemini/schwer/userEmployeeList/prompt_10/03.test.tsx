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
- render in beforeEach

- import of wrong module - 2
- usage of module
- before* etc outside of describe
- varaible - 3

- 5 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -40
CleanCode: -35
Testumfang: 37,35
 */

const sampleUsers: UserNoPw[] = [
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob Smith', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Carol Williams', email: 'carol@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Dave Brown', email: 'dave@example.com', role: USER_ROLE.ADMIN },
    { name: 'Emily Davis', email: 'emily@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Frank Miller', email: 'frank@example.com', role: USER_ROLE.EMPLOYEE },
];

const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(ctx.json(sampleUsers));
    }),
    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        const email = req.url.searchParams.get('email');
        const filteredUsers = sampleUsers.filter((user) => user.email !== email);
        return res(ctx.status(200), ctx.json(filteredUsers));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer Component', () => {
    // Render the component before each test
    beforeEach(() => {
        render(<UserEmployeeListSchwer />);
    });

    it('renders without error and displays users', async () => {
        await waitFor(() => {
            expect(screen.getByText('User List')).toBeInTheDocument();
            expect(screen.getAllByRole('listitem')).toHaveLength(5); // Assuming initial page size of 5
        });
    });

    it('filters users by search term', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(1);
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        });
    });

    it('filters users by role', async () => {
        const select = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(select, USER_ROLE.ADMIN);
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(2);
        });
    });

    it('sorts users by name or email', async () => {
        // Sort by name (default) and check order
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('Alice Johnson');
            expect(listItems[1]).toHaveTextContent('Bob Smith');
        });

        // Sort by email and check order
        await userEvent.click(screen.getByLabelText('Email'));
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('alice@example.com');
            expect(listItems[1]).toHaveTextContent('bob@example.com');
        });
    });

    it('paginates users correctly', async () => {
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(5);
            expect(screen.getByLabelText('Go to next page')).toBeEnabled();
        });
    });

    it('deletes a user', async () => {
        const initialUserCount = screen.getAllByRole('listitem').length;
        const firstDeleteButton = screen.getAllByLabelText(/delete-/i)[0];
        await userEvent.click(firstDeleteButton);

        await waitFor(() => {
            const updatedUserCount = screen.getAllByRole('listitem').length;
            expect(updatedUserCount).toBe(initialUserCount - 1);
        });
    });
});
