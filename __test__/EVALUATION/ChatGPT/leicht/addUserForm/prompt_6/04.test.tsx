import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- clean-code: unnötige render Funktion
- clean-code: Doppelung, userEvent.setup nicht in describe instanziiert
- clean code: setUsers jedesmal neu erstellt statt einmal zu erstellen i.V.m beforeEach
- keine Verwendung von Variablen, um setCall zu testen mit den Eingabedaten

- 3 von 4 notwendigem Testumfang erreicht + 3 Redundanzen

Best-Practices: 0
CleanCode: 0
Testumfang: 37,5
 */

describe('AddUserFormLeicht Component', () => {
    const setup = () => {
        const setUsers = jest.fn();
        const users = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        render(<AddUserFormLeicht setUsers={setUsers} users={users} />);
        return { setUsers, users };
    };

    it('should display entered name', async () => {
        setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'Jane Doe');

        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should display entered email', async () => {
        setup();
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane@example.com');

        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should display entered password', async () => {
        setup();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'Password123!');

        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should select role from dropdown', async () => {
        setup();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error for existing email', async () => {
        const { setUsers, users } = setup();
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, users[0].email);
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error if invalid', async () => {
        setup();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'password');
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('should call setUsers with new user data on valid form submission', async () => {
        const { setUsers } = setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'Jane Doe');
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane.doe@example.com');
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'Password123!');
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password123!',
            },
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);
    });
});
