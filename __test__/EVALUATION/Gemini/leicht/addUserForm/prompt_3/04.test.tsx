import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: userEvent.setup not used
- cirtical: promises not handled
- critical: fireEvent

- render Funktion
- doppelung variablen nicht benutzt - 3 mal
- doppelung screen - 1

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 3 Redundanz

Best-Practices: -30
CleanCode: -25
Testumfang: 62,5
 */

const mockUsers: User[] = [
    {
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

const mockSetUsers = jest.fn();

describe('AddUserFormLeicht', () => {
    const setup = () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
    };

    it('renders form elements correctly', () => {
        setup();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('updates new user state on input change', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        await userEvent.type(nameInput, 'Test Name');
        await userEvent.type(emailInput, 'test@email.com');
        await userEvent.type(passwordInput, 'TestPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput.value).toBe('Test Name');
        expect(emailInput.value).toBe('test@email.com');
        expect(passwordInput.value).toBe('TestPassword123!');
        expect(roleSelect.value).toBe(USER_ROLE.ADMIN);
    });

    it('displays error message when email is already taken', async () => {
        setup();
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(emailInput, 'test@test.com');
        fireEvent.click(addUserButton);
        expect(await screen.findByText('Email already exists!')).toBeVisible();
    });

    it('calls setUsers with updated user list on submit', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@email.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        fireEvent.click(addUserButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@email.com',
                password: 'NewPassword123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('resets form fields after adding a user', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@email.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        fireEvent.click(addUserButton);

        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(roleSelect.value).toBe('');
    });

    it('shows error message for invalid password', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(passwordInput, 'password'); // Invalid password
        fireEvent.click(addUserButton);

        const errorText = await screen.findByText(/Password needs to be 8 characters long/i);
        expect(errorText).toBeVisible();
    });

    it('clears error message after entering valid password', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(passwordInput, 'password');
        fireEvent.click(addUserButton);

        await screen.findByText(/Password needs to be 8 characters long/i);

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'TestPassword1!'); // Valid password

        fireEvent.click(addUserButton);

        expect(screen.queryByText(/Password needs to be 8 characters long/i)).not.toBeInTheDocument();
    });

    it('displays department input for Admin and Employee roles', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('hides department input for Customer role', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
