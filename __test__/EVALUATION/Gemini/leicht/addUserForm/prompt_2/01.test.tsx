import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: userEvent.setup not used
- critical: Verwendung von fireEvent


- clean code: Doppelung - keine variablen - 3 mal
- render Funktion

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 75
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormLeicht Component', () => {
    it('should render the form with all fields', () => {
        render(<AddUserFormLeicht users={[]} setUsers={jest.fn()} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should update the newUser state on input change', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error message if email is already taken', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'password',
            role: USER_ROLE.CUSTOMER,
        };
        setup([existingUser]);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'existing@example.com');
        fireEvent.blur(emailInput);
        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show error message if password is not valid', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test123');
        fireEvent.blur(passwordInput);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should add a new user when the form is submitted', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'New1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'new@example.com',
                password: 'New1234!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should clear the form after adding a new user', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'New1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(setUsers).toHaveBeenCalled();
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('should render department field if user is not a customer', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not render department field if user is a customer', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
