import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup not used
- fireEvent


- render Funktion
- doppelung variablen nicht benutzt - 3 mal

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 75
 */

const mockUsers: User[] = [
    {
        name: 'Test User',
        email: 'test@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

const mockSetUsers = jest.fn();

describe('AddUserFormLeicht Component', () => {
    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render the form with correct inputs', () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should update the newUser state on input change', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test Name');
        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'TestPassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput).toHaveValue('Test Name');
        expect(emailInput).toHaveValue('test@test.com');
        expect(passwordInput).toHaveValue('TestPassword123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show an error message if email is already taken', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'test@example.com');
        fireEvent.blur(emailInput); // Fire blur event to trigger validation

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show an error message if password is not valid', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'test'); // Invalid password
        fireEvent.blur(passwordInput); // Fire blur event to trigger validation

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should add a new user on form submit with valid data', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'NewPassword1!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'NewPassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        // Check if form fields are reset
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('should render the department field if the role is not customer', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not render the department field if the role is customer', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
