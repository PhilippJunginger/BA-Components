import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: userEvent.setup not used
- critical: fireEvent

- render Funktion
- doppelung variablen nicht benutzt - 3 mal
- doppelung screen - 1

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 62,5
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormLeicht Component', () => {
    it('should render all fields', () => {
        setup();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should update user state on input change', async () => {
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

    it('should show error message if email is already taken', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'password123',
            role: USER_ROLE.CUSTOMER,
        };
        const { setUsers } = setup([existingUser]);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'existing@example.com');
        fireEvent.submit(submitButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should show error message if password is not valid', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'Test123');
        fireEvent.submit(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should add new user on submit', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        fireEvent.submit(submitButton);

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Test1234!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should reset form after adding user', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        fireEvent.submit(submitButton);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('should render department field for admin and employee roles', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
