import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- clean code: Doppelung von userEvent.setup aufrufen
- clean code: Verwendung von einer render Funktion
- clean code: Keine Variable benutzt für Prüfung von Eingaben - 2 mal
- clean code: Doppelung von screen... aufrufen

- 4 von 4 notwendigem Testumfang erreicht + 1 Redundanzen

Best-Practices: 0
CleanCode: -30
Testumfang: 87,5
 */

describe('AddUserFormLeicht Component', () => {
    const setup = () => {
        const setUsersMock = jest.fn();
        const usersMock = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ];
        render(<AddUserFormLeicht users={usersMock} setUsers={setUsersMock} />);
        return { setUsersMock, usersMock };
    };

    it('should update input fields correctly', async () => {
        setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');

        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');

        await user.type(passwordInput, 'Password2!');
        expect(passwordInput).toHaveValue('Password2!');
    });

    it('should show error when email already exists', async () => {
        const { usersMock } = setup();
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(emailInput, usersMock[0].email);
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error when password is invalid', async () => {
        setup();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(passwordInput, 'pass');
        await user.click(submitButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it('should add a user successfully', async () => {
        const { setUsersMock, usersMock } = setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password2!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await user.click(submitButton);

        expect(setUsersMock).toHaveBeenCalledWith([
            ...usersMock,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password2!' },
        ]);
    });

    it('should show department field when role is ADMIN or EMPLOYEE', async () => {
        setup();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});

// Schlägt fehl, da der eigentliche Labeltext 'Name *' wäre
screen.getByLabelText('Name');

// Erfolgreich, da zusätzliche Zeichen ignoriert werden
screen.getByLabelText(/Name/i);
