import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: userEvent.setup not used
- critical: fireEvent

- unused import
- render Funktion
- doppelung variablen nicht benutzt - 1 mal
- doppelung screen - 3

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 75
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();

    const utils = render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

    return {
        ...utils,
        setUsers,
    };
};

describe('AddUserFormLeicht', () => {
    it('should render the form with correct initial values', () => {
        render(<AddUserFormLeicht users={[]} setUsers={jest.fn()} />);

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByRole('button', { name: /Add User/i })).toBeEnabled();
    });

    it('should handle form submission correctly', async () => {
        const users: User[] = [];
        const { setUsers } = setup(users);

        const name = 'Test User';
        const email = 'test@example.com';
        const password = 'Password123!';
        const role = USER_ROLE.CUSTOMER;

        await userEvent.type(screen.getByLabelText('Name'), name);
        await userEvent.type(screen.getByLabelText('Email'), email);
        await userEvent.type(screen.getByLabelText('Password'), password);

        fireEvent.change(screen.getByLabelText('Role'), { target: { value: role } });

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsers).toHaveBeenCalledWith([
            {
                name,
                email,
                password,
                role,
            },
        ]);
    });

    it('should show error message when email is already taken', async () => {
        const users: User[] = [
            {
                name: 'Existing User',
                email: 'existing@example.com',
                password: 'password',
                role: USER_ROLE.CUSTOMER,
            },
        ];
        setup(users);

        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should reset the form after submitting', async () => {
        const { setUsers } = setup();

        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsers).toHaveBeenCalled();

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
    });

    it('should display department field for admin and employee roles', async () => {
        setup();

        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText('Department')).toBeVisible();

        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.EMPLOYEE } });
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not display department field for customer role', async () => {
        setup();

        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should handle password validation correctly', async () => {
        setup();

        // Test with an invalid password
        await userEvent.type(screen.getByLabelText('Password'), 'invalid');
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Test with a valid password
        await userEvent.clear(screen.getByLabelText('Password'));
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
    });
});
