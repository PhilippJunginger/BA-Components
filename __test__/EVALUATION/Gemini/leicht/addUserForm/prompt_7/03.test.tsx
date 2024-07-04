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

const testUser: User = {
    name: 'Test User',
    email: 'test@test.com',
    password: 'Password123!',
    role: USER_ROLE.CUSTOMER,
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

    it('should successfully add a new user with valid data', async () => {
        const { setUsers } = setup();
        await userEvent.type(screen.getByLabelText('Name'), testUser.name);
        await userEvent.type(screen.getByLabelText('Email'), testUser.email);
        await userEvent.type(screen.getByLabelText('Password'), testUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), testUser.role);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalledWith([testUser]);
    });

    it('should show an error message if email is already taken', async () => {
        const users: User[] = [
            {
                name: 'Existing User',
                email: 'test@test.com',
                password: 'Password123!',
                role: USER_ROLE.CUSTOMER,
            },
        ];
        setup(users);
        await userEvent.type(screen.getByLabelText('Name'), testUser.name);
        await userEvent.type(screen.getByLabelText('Email'), testUser.email);
        await userEvent.type(screen.getByLabelText('Password'), testUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), testUser.role);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show error messages if password is not valid', async () => {
        setup();
        const invalidPassword = 'password';
        await userEvent.type(screen.getByLabelText('Password'), invalidPassword);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should render department field for admin and employee roles', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should clear the form after adding a user', async () => {
        const { setUsers } = setup();
        await userEvent.type(screen.getByLabelText('Name'), testUser.name);
        await userEvent.type(screen.getByLabelText('Email'), testUser.email);
        await userEvent.type(screen.getByLabelText('Password'), testUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), testUser.role);
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalled();
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });
});
