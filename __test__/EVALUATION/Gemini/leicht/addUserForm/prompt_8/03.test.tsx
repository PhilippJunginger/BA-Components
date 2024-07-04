import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- doppelung variablen nicht benutzt - 2 mal
- doppelung screen...
- setup FUnktion

- 4 von 4 notwendigem Testumfang erreicht + 1 Asunahme + 1 Redundanzen


Best-Practices: 0
CleanCode: -20
Testumfang: 87,5
 */

const setup = () => {
    const users: User[] = [];
    const setUsers = jest.fn();

    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

    return { setUsers };
};

describe('<AddUserFormLeicht />', () => {
    const user = userEvent.setup();

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

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Test123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(addUserButton);

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Test123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should show an error message if the email is already taken', async () => {
        const users: User[] = [
            { name: 'Existing User', email: 'existing@example.com', password: 'password123', role: USER_ROLE.CUSTOMER },
        ];
        render(<AddUserFormLeicht users={users} setUsers={jest.fn()} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'existing@example.com');

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show an error message if the password is not valid', async () => {
        setup();

        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await user.type(passwordInput, 'invalid');
        await user.click(addUserButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should render the department field for admin and employee roles', async () => {
        setup();

        const roleSelect = screen.getByLabelText('Role');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not render the department field for customer role', async () => {
        setup();

        const roleSelect = screen.getByLabelText('Role');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
