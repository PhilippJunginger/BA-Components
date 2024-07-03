import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { PasswordError } from '../../models/passwordError';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent

- clean code: keine variablen erstellt - 2 mal
- clean code: Doppelung screen... - 2
- unused import

- 3 von 7 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: -10
CleanCode: -25
Testumfang: 22,05
*/

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();
    const setUsersMock = jest.fn();
    const routerMock = {
        push: jest.fn(),
        query: {},
    };

    beforeEach(() => {
        setUsersMock.mockClear();
        routerMock.push.mockClear();
    });

    it('should render the form with initial state', () => {
        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should allow typing in text fields', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');

        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
    });

    it('should display password validation errors', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        await user.type(screen.getByLabelText(/password/i), 'short');
        fireEvent.blur(screen.getByLabelText(/password/i));

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        });
    });

    it('should allow selecting a role from the dropdown', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByLabelText(/role/i)).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should call setUsers and reset form on successful submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ userId: '123' }),
                status: 200,
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password1!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledWith([
                { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ]);
        });

        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });

    it('should show error alert on failed submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.reject({ message: 'Error' }),
                status: 500,
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password1!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });
});
