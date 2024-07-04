import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- fireEvent
- userEvent.setup

- setup Funktion
- doppelung variablen
- doppelung screen

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redudndanz


Best-Practices: -20
CleanCode: -20
Testumfang: 75
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
        const { setUsers } = setup();
        const newUser: User = {
            name: 'Test User',
            email: 'test@test.com',
            password: 'TestPassword1!',
            role: USER_ROLE.CUSTOMER,
        };

        await userEvent.type(screen.getByLabelText('Name'), newUser.name);
        await userEvent.type(screen.getByLabelText('Email'), newUser.email);
        await userEvent.type(screen.getByLabelText('Password'), newUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), newUser.role);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalledWith([newUser]);
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
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should show error messages for invalid password', async () => {
        setup();
        const invalidPassword = 'short';

        await userEvent.type(screen.getByLabelText('Password'), invalidPassword);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should render department field for admin and employee roles', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not render department field for customer role', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should clear the form after adding a user', async () => {
        const { setUsers } = setup();
        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'test@test.com');
        await userEvent.type(screen.getByLabelText('Password'), 'TestPassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalled();
        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('');
        expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('');
        expect((screen.getByLabelText('Password') as HTMLInputElement).value).toBe('');
        expect((screen.getByLabelText('Role') as HTMLSelectElement).value).toBe('');
    });
});
