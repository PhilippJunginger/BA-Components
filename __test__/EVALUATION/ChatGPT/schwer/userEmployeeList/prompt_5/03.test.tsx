import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promises
- mock of wrong query instead of fetch
- waitFor
- import of unnecessary module

- unused import
- vairablen - 6
- unnecessary waitFor - 6
- render Funktion

- 5 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -50
CleanCode: -70
Tetumfang: 37,35
 */

// Mock server setup
const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(
            ctx.json([
                { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
                { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
            ]),
        );
    }),
    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        return res(ctx.status(200));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const queryClient = new QueryClient();

const renderComponent = () =>
    render(
        <QueryClientProvider client={queryClient}>
            <UserEmployeeListSchwer />
        </QueryClientProvider>,
    );

describe('UserEmployeeListSchwer', () => {
    test('renders user list with fetched users', async () => {
        renderComponent();

        expect(screen.getByText(/User List/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });
    });

    test('displays no users matching the current search', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        await userEvent.type(screen.getByLabelText(/Search Users/i), 'nonexistent');

        await waitFor(() => {
            expect(screen.getByText(/There are no users matching the current search/i)).toBeInTheDocument();
        });
    });

    test('allows user to change sort option', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);

        expect(emailRadio).toBeChecked();
    });

    test('filters users by role', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        await userEvent.selectOptions(screen.getByLabelText('Filter by Role'), [USER_ROLE.EMPLOYEE]);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('handles user deletion with snackbar message on failure', async () => {
        server.use(
            rest.post('http://localhost:8080/user', (req, res, ctx) => {
                return res(ctx.status(500));
            }),
        );

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByLabelText('delete-John Doe'));

        await waitFor(() => {
            expect(screen.getByText(/Deletion of user failed!/i)).toBeInTheDocument();
        });
    });

    test('navigates to user edit page on edit button click', async () => {
        const pushMock = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({
            push: pushMock,
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByLabelText('edit-John Doe'));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });
});
