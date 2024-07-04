import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*


- doppelung userEvent-setup
- render Funktion
- unused import
- doppelung variablen nicht benutzt - 1 mal

- 4 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: 0
CleanCode: -20
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
        const user = userEvent.setup();
        const { setUsers } = setup();
        const name = 'Test User';
        const email = 'test@test.com';
        const password = 'TestPassword1!';
        const role = USER_ROLE.CUSTOMER;

        await user.type(screen.getByLabelText('Name'), name);
        await user.type(screen.getByLabelText('Email'), email);
        await user.type(screen.getByLabelText('Password'), password);
        await user.selectOptions(screen.getByLabelText('Role'), role);
        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalledWith([
            {
                name,
                email,
                password,
                role,
            },
        ]);
    });

    it('should show error message if email already exists', async () => {
        const user = userEvent.setup();
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@test.com',
            password: 'ExistingPassword1!',
            role: USER_ROLE.CUSTOMER,
        };
        const { setUsers } = setup([existingUser]);

        await user.type(screen.getByLabelText('Name'), 'New User');
        await user.type(screen.getByLabelText('Email'), existingUser.email);
        await user.type(screen.getByLabelText('Password'), 'NewPassword1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should show error message if password is not valid', async () => {
        const user = userEvent.setup();
        const { setUsers } = setup();

        await user.type(screen.getByLabelText('Name'), 'New User');
        await user.type(screen.getByLabelText('Email'), 'new@test.com');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should render department field if role is not customer', async () => {
        const user = userEvent.setup();
        setup();

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not render department field if role is customer', async () => {
        const user = userEvent.setup();
        setup();

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
