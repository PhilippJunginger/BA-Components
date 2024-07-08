import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- missing assertion

- import of wrong module - 2
- usage of module
- before* etc outside of describe
- varaible - 3

- 7 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -35
Testumfang: 49,8
 */

const users = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jack Doe', email: 'jack.doe@example.com', role: USER_ROLE.EMPLOYEE },
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

describe('UserEmployeeListSchwer', () => {
    it('should render user list correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(users.length);
    });

    it('should filter users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const filterSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(filterSelect, USER_ROLE.EMPLOYEE);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(2);
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const sortRadioButtons = screen.getAllByRole('radio');
        await userEvent.click(sortRadioButtons[0]);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems[0].textContent).toContain('Jane Doe');
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListSchwer />);
        const sortRadioButtons = screen.getAllByRole('radio');
        await userEvent.click(sortRadioButtons[1]);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems[0].textContent).toContain('jack.doe@example.com');
    });

    it('should paginate users', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('navigation');
        const pageButtons = await screen.findAllByRole('button', { name: /Go to page/i });
        expect(pageButtons).toHaveLength(1);
        expect(pagination).toBeVisible();
    });

    it('should display a message when no users are found', async () => {
        server.use(
            rest.get('http://localhost:8080/users', (req, res, ctx) => {
                return res(ctx.status(200), ctx.json([]));
            }),
        );
        render(<UserEmployeeListSchwer />);
        const message = await screen.findByText('No Users created');
        expect(message).toBeVisible();
    });

    it('should handle user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        const deleteButtons = await screen.findAllByRole('button', {
            name: /delete/i,
        });
        await userEvent.click(deleteButtons[0]);
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(2);
        });
    });

    it('should handle user deletion error', async () => {
        server.use(
            rest.post('http://localhost:8080/user', (req, res, ctx) => {
                return res(ctx.status(400));
            }),
        );
        render(<UserEmployeeListSchwer />);
        const deleteButtons = await screen.findAllByRole('button', {
            name: /delete/i,
        });
        await userEvent.click(deleteButtons[0]);
        const snackbar = await screen.findByRole('alert');
        expect(snackbar).toBeVisible();
    });

    it('should navigate to edit user page', async () => {
        render(<UserEmployeeListSchwer />);
        const editButtons = await screen.findAllByRole('button', {
            name: /edit/i,
        });
        await userEvent.click(editButtons[0]);
        // Add assertion to check if the navigation happened correctly
    });
});
