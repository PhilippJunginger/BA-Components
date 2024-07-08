import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promise
- prefer findBy
- fireEvent

- import of wrong module - 2
- usage of module
- before* etc outside of describe
- variables - 5
- unnecessary waitFor

- 5 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -40
CleanCode: -50
Testumfang: 37,35
 */

// MSW server setup
const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(
            ctx.json([
                { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
                { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
                { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.CUSTOMER },
            ]),
        );
    }),

    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        // For successful deletion, return a 200 status
        return res(ctx.status(200));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer', () => {
    it('renders users correctly', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        // Customer should be filtered out
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'jane');
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');
        const filterSelect = screen.getByLabelText('Filter by Role');
        fireEvent.change(filterSelect, { target: { value: USER_ROLE.EMPLOYEE } });
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('sorts users', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');

        const sortBy = screen.getAllByRole('radio'); // Get all radio buttons for sorting
        fireEvent.click(sortBy[1]); // Click the "Email" radio button

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('John Doe');
        expect(userItems[1]).toHaveTextContent('Jane Smith');
    });

    it('deletes a user', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');
        const deleteButton = screen.getAllByLabelText('delete-')[0];
        await userEvent.click(deleteButton);
        await waitFor(() => expect(screen.queryByText('John Doe')).not.toBeInTheDocument());
    });

    it('handles errors gracefully', async () => {
        server.use(
            rest.get('http://localhost:8080/users', (req, res, ctx) => {
                return res(ctx.status(500));
            }),
        );
        render(<UserEmployeeListSchwer />);
        expect(await screen.findByText(/error occurred/i)).toBeInTheDocument();
    });
});
