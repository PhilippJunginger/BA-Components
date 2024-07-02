import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- clean code: Doppelung von userEvent.setup aufrufen
- clean code: Verwendung von einer render Funktion
- clean code: Keine Variable benutzt für Prüfung von Eingaben - 2 mal

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundanzen

Best-Practices: 0
CleanCode: -20
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const setup = () => {
        const setUsers = jest.fn();
        const users: User[] = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Passw0rd!' },
        ];
        render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
        return { setUsers, users };
    };

    it('should render form fields correctly', () => {
        setup();

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should update the form fields on user input', async () => {
        const user = userEvent.setup();
        setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.EMPLOYEE }));

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.EMPLOYEE);
    });

    it('should display password error if the password does not meet criteria', async () => {
        const user = userEvent.setup();
        setup();

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        await user.type(passwordInput, 'short');
        await user.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should display email error if the email already exists', async () => {
        const user = userEvent.setup();
        setup();

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByText('Add User');

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should add a new user successfully when the form is valid', async () => {
        const user = userEvent.setup();
        const { setUsers, users } = setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.EMPLOYEE }));
        await user.click(submitButton);

        expect(setUsers).toHaveBeenCalledWith([
            ...users,
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: USER_ROLE.EMPLOYEE,
                password: 'Password123!',
            },
        ]);
    });

    it('should show department field when role is not CUSTOMER', async () => {
        const user = userEvent.setup();
        setup();

        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.EMPLOYEE }));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
