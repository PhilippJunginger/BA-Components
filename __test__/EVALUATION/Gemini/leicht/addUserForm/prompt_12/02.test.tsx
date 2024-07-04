import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup
- render in beforeEach

- doppelung variablen -3 mal
- doppelung screen

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redudndanz


Best-Practices: -20
CleanCode: -20
Testumfang: 87,5
 */

describe('AddUserFormLeicht', () => {
    const user = userEvent.setup();
    const setUsersMock = jest.fn();
    const users: User[] = [
        {
            name: 'Test User',
            email: 'test@test.com',
            role: USER_ROLE.CUSTOMER,
            password: 'password123',
        },
    ];

    beforeEach(() => {
        setUsersMock.mockClear();
        render(<AddUserFormLeicht setUsers={setUsersMock} users={users} />);
    });

    it('should render all input fields', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should update input fields on change', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Test User 2');
        await user.type(emailInput, 'test2@test.com');
        await user.type(passwordInput, 'password123');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User 2');
        expect(emailInput).toHaveValue('test2@test.com');
        expect(passwordInput).toHaveValue('password123');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error message for existing email', async () => {
        const emailInput = screen.getByLabelText('Email');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'test@test.com');
        await user.click(addUserButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show error message for invalid password', async () => {
        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await user.type(passwordInput, 'password');
        await user.click(addUserButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should add a new user with valid input', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'Test User 2');
        await user.type(emailInput, 'test2@test.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        await user.click(addUserButton);

        expect(setUsersMock).toHaveBeenCalledWith([
            ...users,
            {
                name: 'Test User 2',
                email: 'test2@test.com',
                password: 'Password123!',
                role: USER_ROLE.EMPLOYEE,
            },
        ]);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
    });

    it('should render department input for admin and employee roles', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not render department input for customer role', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
