import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: not using UserEvent.setup()
- critical: not handling promises from userEvent actions

- clean code: Verwendung von render in beforeEach
- clean code: Keine Variable benutzt für Prüfung von Eingaben - 2 mal
- clean code: unused import
- clean code: Doppelung von screen... aufrufen - 2 mal

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundanzen

Best-Practices: -20
CleanCode: -20
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const setUsersMock = jest.fn();
    const initialUsers: User[] = [];

    beforeEach(() => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);
    });

    test('renders form inputs correctly', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('displays password error message when password is invalid', async () => {
        await userEvent.type(screen.getByLabelText(/password/i), 'invalid');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('displays email error message when email is already taken', async () => {
        const duplicateUser: User = {
            name: 'John Doe',
            email: 'johndoe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        render(<AddUserFormLeicht users={[duplicateUser]} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'johndoe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with correct data on successful form submission', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'janedoe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'janedoe@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password1!',
            },
        ]);
    });

    test.skip('displays department field when role is ADMIN or EMPLOYEE', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test.skip('clears form after successful submission', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'janedoe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });
});
