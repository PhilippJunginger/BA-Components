import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup not used
- fireEvent


- render Funktion
- doppelung variablen nicht benutzt - 3 mal
- doppelung screen - 1mal

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 62,5
 */

const mockSetUsers = jest.fn();
const mockUsers: User[] = [
    {
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testpassword1!',
    },
];

const setup = () => {
    render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
};

describe('AddUserFormLeicht Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with all fields', () => {
        setup();

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('updates the newUser state on input change', () => {
        setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(nameInput, { target: { value: 'Test Name' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'TestPassword1!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect((nameInput as HTMLInputElement).value).toBe('Test Name');
        expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
        expect((passwordInput as HTMLInputElement).value).toBe('TestPassword1!');
        expect((roleSelect as HTMLSelectElement).value).toBe(USER_ROLE.ADMIN);
    });

    it('shows an error message if email is already taken', async () => {
        setup();

        const emailInput = screen.getByLabelText('Email');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.click(addUserButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('shows an error message if password is not valid', async () => {
        setup();

        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'test');
        await userEvent.click(addUserButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('adds a new user with valid data', async () => {
        setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'NewPassword1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(addUserButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'NewPassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('clears the form after adding a user', async () => {
        setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'NewPassword1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(addUserButton);

        expect((nameInput as HTMLInputElement).value).toBe('');
        expect((emailInput as HTMLInputElement).value).toBe('');
        expect((passwordInput as HTMLInputElement).value).toBe('');
        expect((roleSelect as HTMLSelectElement).value).toBe('');
    });

    it('renders department field for admin and employee roles', async () => {
        setup();

        const roleSelect = screen.getByLabelText('Role');

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
