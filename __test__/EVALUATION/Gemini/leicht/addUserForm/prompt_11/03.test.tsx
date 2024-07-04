import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup

- setup Funktion
- unused import
- doppelung variablen
- doppelung screen

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redudndanz


Best-Practices: -10
CleanCode: -25
Testumfang: 75
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormLeicht', () => {
    it('should render all fields', () => {
        render(<AddUserFormLeicht users={[]} setUsers={jest.fn()} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should add a new user with valid data', async () => {
        const { setUsers } = setup();
        const name = 'Test User';
        const email = 'test@test.com';
        const password = 'TestPassword1!';
        const role = USER_ROLE.CUSTOMER;

        await userEvent.type(screen.getByLabelText('Name'), name);
        await userEvent.type(screen.getByLabelText('Email'), email);
        await userEvent.type(screen.getByLabelText('Password'), password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), [role]);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalledWith([{ name, email, password, role, department: undefined }]);
    });

    it('should show error message when email is already taken', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@test.com',
            password: 'ExistingPassword1!',
            role: USER_ROLE.CUSTOMER,
        };
        const { setUsers } = setup([existingUser]);

        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), existingUser.email);
        await userEvent.type(screen.getByLabelText('Password'), 'TestPassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.CUSTOMER]);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should show error message when password is not valid', async () => {
        const { setUsers } = setup();

        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'test@test.com');
        await userEvent.type(screen.getByLabelText('Password'), 'password');
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.CUSTOMER]);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should render department field for admin and employee roles', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.ADMIN]);
        expect(screen.getByLabelText('Department')).toBeVisible();

        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.EMPLOYEE]);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not render department field for customer role', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.CUSTOMER]);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should reset form after adding a user', async () => {
        const { setUsers } = setup();
        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'test@test.com');
        await userEvent.type(screen.getByLabelText('Password'), 'TestPassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.CUSTOMER]);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalled();
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });
});
