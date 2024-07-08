import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../../__mocks__/server';
import { rest } from 'msw';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- promises
- setup
- prefer findBy
- missing assertion - 2
- node access

- not needed import - 2
- usage of not needed imports
- variables - 2
- overly complicated test

- 2 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -60
CleanCode: -30
Testumfang: 8,3
 */

const mockUsers: UserNoPw[] = [
    { email: 'john.doe@example.com', name: 'John Doe', role: USER_ROLE.EMPLOYEE },
    { email: 'jane.smith@example.com', name: 'Jane Smith', role: USER_ROLE.ADMIN },
    // ... more mock users
];

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        server.use(
            rest.get('http://localhost:8080/users', (req, res, ctx) => {
                return res(ctx.json(mockUsers));
            }),
        );
    });

    it('renders user list and handles search, sort, filter, pagination', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('User List');

        // Initial display
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        expect(screen.getByText('John Doe')).toBeInTheDocument();

        // Search
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'jane');
        await waitFor(() => expect(screen.queryByText('John Doe')).not.toBeInTheDocument());
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();

        // Sort
        await userEvent.click(screen.getByLabelText('Sort by'));
        await userEvent.click(screen.getByLabelText('Email'));

        // Filter
        await userEvent.click(screen.getByLabelText('Filter by Role'));
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));

        // Pagination
        await userEvent.click(screen.getByLabelText('Go to next page'));
    });

    it('handles fetch errors gracefully', async () => {
        server.use(
            rest.get('http://localhost:8080/users', (req, res, ctx) => {
                return res(ctx.status(500));
            }),
        );
        render(<UserEmployeeListSchwer />);
        await screen.findByText('An error occurred while retrieving users');
    });

    it('displays a message when no users are found', async () => {
        server.use(
            rest.get('http://localhost:8080/users', (req, res, ctx) => {
                return res(ctx.json([]));
            }),
        );
        render(<UserEmployeeListSchwer />);
        await screen.findByText('No Users created');
    });

    it('has proper aria labels for accessibility', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('User List');
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveAccessibleName('John Doe');
        expect(listItems[0].querySelector('button')).toHaveAccessibleName('edit-John Doe');
    });

    // Add tests for user deletion, routing errors,
    // Snackbar display on deletion failure, and UI details like role attributes
});
