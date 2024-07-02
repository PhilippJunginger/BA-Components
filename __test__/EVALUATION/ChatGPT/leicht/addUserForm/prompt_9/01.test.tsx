import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: Verwendung von fireEvent
- critical: not handling promises from UserEvent
- critical: not using userEvent.setup()

- clean-code: Verwendung einer extra renderFunktion
- clean code: Keine Variable benutzt für Prüfung von Eingaben
- clean code: Doppelung

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanzen

Best-Practices: -30
CleanCode: -15
Testumfang: 75
 */

describe('AddUserFormLeicht Component', () => {
    const initialUsers: User[] = [];

    const renderComponent = (users = initialUsers, setUsers = jest.fn()) => {
        render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    };

    test('renders form fields correctly', () => {
        renderComponent();

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });

    test('shows password error when password is invalid', async () => {
        renderComponent();

        await userEvent.type(screen.getByLabelText(/password/i), 'invalid');

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('shows email error when email is already taken', async () => {
        const users = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' }];
        renderComponent(users);

        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with correct user data when form is valid', async () => {
        const setUsers = jest.fn();
        renderComponent(initialUsers, setUsers);

        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password1!',
            },
        ]);
    });

    test.skip('clears form fields after successful submission', async () => {
        const setUsers = jest.fn();
        renderComponent(initialUsers, setUsers);

        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });

    test.skip('renders department field if role is not customer', async () => {
        renderComponent();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field if role is customer', async () => {
        renderComponent();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });
});
