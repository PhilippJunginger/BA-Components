import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: promises not handled
- critical: userEvent.setup not used

- unused import
- render Funktion
- doppelung variablen nicht benutzt - 4 mal
- doppelung screen

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanz

Best-Practices: -30
CleanCode: -30
Testumfang: 75
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormLeicht', () => {
    it('renders all fields', () => {
        setup();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('renders department field for admin and employee', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('does not render department field for customer', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('validates password correctly', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.click(addUserButton);
        expect(screen.queryByText(/Password needs to be 8 characters long/i)).not.toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Test1!');
        await userEvent.click(addUserButton);
        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeVisible();
    });

    it('handles user creation correctly', async () => {
        const users: User[] = [
            { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Existing1!' },
        ];
        const { setUsers } = setup(users);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'New1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(addUserButton);

        expect(setUsers).toHaveBeenCalledWith([
            ...users,
            { name: 'New User', email: 'new@example.com', role: USER_ROLE.CUSTOMER, password: 'New1234!' },
        ]);
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('handles duplicate email error', async () => {
        const users: User[] = [
            { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Existing1!' },
        ];
        setup(users);
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'existing@example.com');
        await userEvent.type(passwordInput, 'Existing1!');
        await userEvent.click(addUserButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });
});
