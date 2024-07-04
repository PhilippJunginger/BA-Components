import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup

- setuo FUnktion
- doppelung variablen -3 mal
- doppelung screen
- TypeError

- 4 von 4 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -10
CleanCode: -30
Testumfang: 75
 */

const setup = () => {
    const users: User[] = [];
    const setUsers = jest.fn();

    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

    return { users, setUsers };
};

describe('AddUserFormLeicht', () => {
    it('renders all input fields', () => {
        render(<AddUserFormLeicht users={[]} setUsers={() => {}} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('updates input fields correctly', async () => {
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
        expect(screen.getByRole('option', { name: USER_ROLE.ADMIN }).selected).toBe(true);
    });

    it('displays error message for existing email', async () => {
        const { users, setUsers } = setup();
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'password',
            role: USER_ROLE.CUSTOMER,
        };
        users.push(existingUser);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'existing@example.com');
        await userEvent.click(screen.getByText('Add User'));

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('displays error message for invalid password', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'invalid');
        await userEvent.click(screen.getByText('Add User'));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('adds a new user with valid data', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'New1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByText('Add User'));

        expect(setUsers).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'New1234!',
                    role: USER_ROLE.CUSTOMER,
                }),
            ]),
        );
    });

    it('resets the form after adding a user', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'New1234!');
        await userEvent.click(screen.getByText('Add User'));

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
    });

    it('shows department field for admin and employee roles', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });
});
