import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup

- unused import
- doppelung variablen nicht benutzt - 2 mal
- doppelung screen...
- setup FUnktion

- 4 von 4 notwendigem Testumfang erreicht + 1 Asunahme + 1 Redundanzen


Best-Practices: -10
CleanCode: -25
Testumfang: 87,5
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormLeicht', () => {
    it('should render all fields', () => {
        setup();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should add a new user with valid data', async () => {
        const user: User = {
            name: 'Test User',
            email: 'test@test.com',
            password: 'TestPassword1!',
            role: USER_ROLE.CUSTOMER,
        };
        const { setUsers } = setup();
        await userEvent.type(screen.getByLabelText('Name'), user.name);
        await userEvent.type(screen.getByLabelText('Email'), user.email);
        await userEvent.type(screen.getByLabelText('Password'), user.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), user.role);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        expect(setUsers).toHaveBeenCalledWith([user]);
    });

    it('should show an error message if email is already taken', async () => {
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
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should show error messages if password is not valid', async () => {
        const { setUsers } = setup();
        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'test@test.com');
        await userEvent.type(screen.getByLabelText('Password'), 'password');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should render department field if user is not a customer', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not render department field if user is a customer', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
