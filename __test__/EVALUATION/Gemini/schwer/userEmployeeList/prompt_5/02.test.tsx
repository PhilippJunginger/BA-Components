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
- sideeffect waitFOr

- not needed import - 2
- usage of not needed imports
- variable - 2
- before* outside of describe
- typeerror

- 2 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -50
CleanCode: -35
Testumfang: 12,45
 */

const sampleUsers: UserNoPw[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { id: 4, name: 'Bob Brown', email: 'bob@example.com', role: USER_ROLE.ADMIN },
    { id: 5, name: 'Eve White', email: 'eve@example.com', role: USER_ROLE.EMPLOYEE },
];

const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(ctx.json(sampleUsers));
    }),

    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        const email = req.url.searchParams.get('email');
        const user = sampleUsers.find((u) => u.email === email);

        if (!user) return res(ctx.status(404)); // simulate user not found

        const newUsers = sampleUsers.filter((u) => u.email !== email);
        sampleUsers.length = 0;
        sampleUsers.push(...newUsers);

        return res(ctx.json({})); // Simulate success response after delete
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer Component', () => {
    // ... Tests for initial render, filtering, sorting, pagination, etc.

    it('renders without errors and displays user list', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            sampleUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);

        // Input a search term that matches some users
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    it('sorts users', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            const emailSortRadio = screen.getByLabelText('Email');
            fireEvent.click(emailSortRadio);

            const userItems = screen.getAllByRole('listitem');

            expect(userItems[0]).toHaveTextContent('alice@example.com'); // Alice's email is first alphabetically
        });
    });

    // ... Add more tests for edit/delete functionality, error handling, etc.
});
