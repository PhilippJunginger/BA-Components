import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- userEvent.setup
- render in beforeEach

- doppelung variablen -3 mal
- doppelung screen

- 4 von 4 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -20
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        mockSetUsers.mockClear();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders all input fields', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('updates input fields on change', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Test1234!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('displays error message for existing email', async () => {
        const user = userEvent.setup();
        const existingUser = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'ExistingPassword1!',
        };
        mockUsers.push(existingUser);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'existing@example.com');
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('displays error message for invalid password', async () => {
        const user = userEvent.setup();
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'invalid');
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('adds a new user with valid input', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'new@example.com');
        await user.type(passwordInput, 'NewPassword1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'new@example.com',
                password: 'NewPassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('shows department field for admin and employee roles', async () => {
        const user = userEvent.setup();
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });
});
