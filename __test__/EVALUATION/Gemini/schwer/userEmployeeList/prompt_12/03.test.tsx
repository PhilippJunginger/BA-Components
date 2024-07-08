import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- waitFor assertions
- missing assertion

- import of wrong module - 2
- usage of module
- before* etc outside of describe
- varaible - 1

- 6 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -40
CleanCode: -25
Testumfang: 41,5
 */

const users = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Peter Pan', email: 'peter.pan@example.com', role: USER_ROLE.ADMIN },
];

const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(users));
    }),
    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        const email = req.url.searchParams.get('email');
        if (email) {
            return res(ctx.status(200), ctx.json({}));
        } else {
            return res(ctx.status(400));
        }
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserEmployeeListSchwer Component', () => {
    it('should render user list correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(users.length);
    });

    it('should filter users by search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        await userEvent.click(screen.getByLabelText('Name'));
        expect(sortBySelect).toHaveValue('name');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const filterSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(2);
    });

    it('should paginate users', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('navigation');
        const pageButtons = await screen.findAllByRole('button', { name: /Go to page/ });
        expect(pageButtons).toHaveLength(1);
        expect(pagination).toBeVisible();
    });

    it('should delete user', async () => {
        render(<UserEmployeeListSchwer />);
        const deleteButton = await screen.findAllByLabelText(/delete/i);
        await userEvent.click(deleteButton[0]);
        await waitFor(() => {
            const userListItems = screen.queryAllByRole('listitem');
            expect(userListItems).toHaveLength(2);
        });
    });

    it('should show error message when deleting user fails', async () => {
        server.use(
            rest.post('http://localhost:8080/user', (req, res, ctx) => {
                return res(ctx.status(400));
            }),
        );
        render(<UserEmployeeListSchwer />);
        const deleteButton = await screen.findAllByLabelText(/delete/i);
        await userEvent.click(deleteButton[0]);
        expect(await screen.findByText('Deletion of user failed!')).toBeVisible();
    });

    it('should navigate to edit user page', async () => {
        render(<UserEmployeeListSchwer />);
        const editButton = await screen.findAllByLabelText(/edit/i);
        await userEvent.click(editButton[0]);
        // Add assertion to check if the navigation happened correctly
    });
});
