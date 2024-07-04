import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- fireEvent

- doppelung keine Variable - 3
- doppelung screen..
- missing import
- setup funktion
- typeError

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -10
CleanCode: -35
Testumfang: 50,1
 */

const user = userEvent.setup();

describe('AddUserFormMittel', () => {
    const setup = () => {
        const setUsers = jest.fn();
        const users = [];
        render(<AddUserFormMittel setUsers={setUsers} users={users} />);
        return { setUsers, users };
    };

    it('should render all fields', () => {
        render(<AddUserFormMittel setUsers={jest.fn()} users={[]} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should update user details on input change', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Test@1234');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test@1234');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password error messages', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'Test');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should handle user creation', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Test@12345');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await user.click(addUserButton);

        expect(setUsers).toHaveBeenCalledTimes(1);
    });

    it('should show error message if email is already taken', async () => {
        const { users } = setup();
        users.push({
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'password',
            role: USER_ROLE.CUSTOMER,
        });

        const emailInput = screen.getByLabelText('Email');
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(emailInput, 'existing@example.com');
        await user.click(addUserButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should display department field for admin and employee roles', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText('Department')).toBeVisible();

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });
        expect(screen.getByLabelText('Department')).toBeVisible();
    });
});
