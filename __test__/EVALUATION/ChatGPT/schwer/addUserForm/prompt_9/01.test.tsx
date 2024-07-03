import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- very critical: userEvent nicht verwendet

- unused import
- clean code: keine variablen erstellt - 3 mal
- render Funkton erstellt
- TypeError

- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -30
Testumfang: 50,05
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer', () => {
    const setUsers = jest.fn();
    const mockRouterPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: {},
            push: mockRouterPush,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (users = []) => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);
    };

    test('renders form fields correctly', () => {
        renderComponent();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });

    test('shows password error messages for invalid password', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test('displays error when email is already taken', async () => {
        const existingUser = {
            name: 'John',
            email: 'john@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        renderComponent([existingUser]);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
    });

    test.skip('successful form submission calls setUsers and resets form', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        renderComponent();

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(setUsers).toHaveBeenCalledTimes(1));
        expect(setUsers).toHaveBeenCalledWith(
            expect.arrayContaining([
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
            ]),
        );
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
    });

    test.skip('navigates to user detail page on successful form submission if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({
            query: { shouldRoute: 'true' },
            push: mockRouterPush,
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        renderComponent();

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(mockRouterPush).toHaveBeenCalledTimes(1));
        expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
    });
});
