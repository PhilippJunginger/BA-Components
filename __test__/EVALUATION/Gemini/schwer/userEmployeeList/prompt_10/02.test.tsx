import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promise
- prefer findBy

- import of wrong module - 2
- usage of module
- before* etc outside of describe
- varaible - 5
- enum

- 4 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -30
CleanCode: -50
Testumfang: 29,05
 */

// Mock API responses
const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(
            ctx.json([
                { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
                { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
                { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
            ]),
        );
    }),
    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        const email = req.url.searchParams.get('email');
        return res(ctx.json({ success: true, deletedEmail: email }));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer Component', () => {
    it('renders and fetches users', async () => {
        render(<UserEmployeeListSchwer />);

        await screen.findByText('User List');

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();

        // Customer should be filtered out
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('User List');

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('sorts users', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('User List');

        await userEvent.click(screen.getByLabelText('Email'));

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice');
        expect(listItems[1]).toHaveTextContent('Bob');
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('User List');

        await userEvent.click(screen.getByLabelText('Filter by Role'));
        await userEvent.click(screen.getByText('ADMIN'));

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('deletes a user', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('User List');

        await userEvent.click(screen.getAllByLabelText('delete-Alice')[0]);
        await waitFor(() => expect(screen.queryByText('Alice')).not.toBeInTheDocument());
    });
    // ... additional tests for pagination, error handling, etc.
});
