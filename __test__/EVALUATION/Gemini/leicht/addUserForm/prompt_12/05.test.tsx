import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup

- setup Funktion
- doppelung variablen
- doppelung screen

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redudndanz


Best-Practices: -10
CleanCode: -15
Testumfang: 87,5
 */

const setup = () => {
    const users: User[] = [];
    const setUsers = jest.fn();

    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

    return { setUsers };
};

describe('AddUserFormLeicht', () => {
    it('should render all fields', () => {
        setup();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should add a new user with valid details', async () => {
        const { setUsers } = setup();
        const user: User = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'TestPassword1!',
            role: USER_ROLE.CUSTOMER,
        };

        await userEvent.type(screen.getByLabelText('Name'), user.name);
        await userEvent.type(screen.getByLabelText('Email'), user.email);
        await userEvent.type(screen.getByLabelText('Password'), user.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), user.role);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalledWith([user]);
    });

    it('should show error message for existing email', async () => {
        const users: User[] = [
            { name: 'Existing User', email: 'existing@example.com', password: 'password', role: USER_ROLE.CUSTOMER },
        ];
        const setUsers = jest.fn();

        render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'TestPassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should show error message for invalid password', async () => {
        setup();

        await userEvent.type(screen.getByLabelText('Password'), 'short');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeVisible();
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
});
