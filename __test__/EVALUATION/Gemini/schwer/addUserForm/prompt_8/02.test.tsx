import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup

- variable - 3

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -10
CleanCode: -15
Testumfang: 50,1
 */

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('renders the form with all fields', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByText('Create new User')).toBeVisible();
        expect(screen.getByLabelText('Name')).toBeVisible();
        expect(screen.getByLabelText('Email')).toBeVisible();
        expect(screen.getByLabelText('Password')).toBeVisible();
        expect(screen.getByLabelText('Role')).toBeVisible();
        expect(screen.getByText('Add User')).toBeVisible();
    });

    it('updates the newUser state on input change', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'TestPassword1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('TestPassword1!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('validates the password and shows error messages', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
        const passwordInput = screen.getByLabelText('Password');

        // Test invalid passwords and check for error messages
        await userEvent.type(passwordInput, 'test');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Testtest1');
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        // Test a valid password and check that no error messages are shown
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'TestPassword1!');
        expect(screen.queryByText('Password needs to be 8 characters long')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one digit')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one uppercase and one lowercase letter')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one special character')).toBeNull();
    });

    it('shows an error message if the email is already taken', async () => {
        const mockUsersWithExistingEmail: User[] = [
            {
                name: 'Existing User',
                email: 'existing@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'ExistingPassword1!',
            },
        ];

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsersWithExistingEmail} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'existing@example.com');

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'TestPassword1!');

        const addUserButton = screen.getByText('Add User');
        await userEvent.click(addUserButton);

        await waitFor(() => expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible());
    });

    it('adds a new user on submit', async () => {
        // Mock the fetch call to return a successful response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: 'newUserId' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'NewPassword1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(addUserButton);

        // Assertions
        await waitFor(() =>
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'NewPassword1!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]),
        );
    });

    it('shows the department field for non-customer roles', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('hides the department field for customer role', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).toBeNull();
    });
});
