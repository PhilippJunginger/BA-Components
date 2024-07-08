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
- missing assertion

- import of wrong module - 2
- usage of module
- before* etc outside of describe
- overloaded test
- complicated test

- 3 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -40
CleanCode: -30
Testumfang: 20,75
 */

const mockUsers: UserNoPw[] = [
    { email: 'admin@example.com', name: 'Admin User', role: USER_ROLE.ADMIN },
    { email: 'employee1@example.com', name: 'Employee One', role: USER_ROLE.EMPLOYEE },
    { email: 'employee2@example.com', name: 'Employee Two', role: USER_ROLE.EMPLOYEE },
    // ... more mock users if needed
];

const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(ctx.json(mockUsers));
    }),
    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        const email = req.url.searchParams.get('email');
        const userIndex = mockUsers.findIndex((user) => user.email === email);
        if (userIndex > -1) {
            mockUsers.splice(userIndex, 1);
        }

        return res(ctx.json({}));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer', () => {
    it('renders users correctly', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });
    });

    it('filters and sorts users correctly', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for users to load
        await screen.findByText(mockUsers[0].name);

        // Search
        await userEvent.type(screen.getByLabelText('Search Users'), 'employee');
        await waitFor(() => {
            mockUsers
                .filter((u) => u.role === USER_ROLE.EMPLOYEE)
                .forEach((user) => {
                    expect(screen.getByText(user.name)).toBeInTheDocument();
                });
            mockUsers
                .filter((u) => u.role === USER_ROLE.ADMIN)
                .forEach((user) => {
                    expect(screen.queryByText(user.name)).not.toBeInTheDocument();
                });
        });

        // Sort
        await userEvent.click(screen.getByLabelText('Email'));
        await waitFor(() => {
            const emails = screen.getAllByText(/@example.com/);
            for (let i = 0; i < emails.length - 1; i++) {
                expect(emails[i].textContent).toBeLessThanOrEqual(emails[i + 1].textContent);
            }
        });
    });

    it('paginates users', async () => {
        // ... test to ensure only rowsPerPage users are shown at a time, and pagination works ...
    });

    it('deletes a user', async () => {
        render(<UserEmployeeListSchwer />);

        // Wait for users to load
        await screen.findByText(mockUsers[0].name);

        // Delete the first user
        await userEvent.click(screen.getAllByLabelText(/delete-/i)[0]);
        await waitFor(() => {
            expect(screen.queryByText(mockUsers[0].name)).not.toBeInTheDocument();
        });
    });

    // ... more tests for error handling, navigation, Snackbar, etc.
});
