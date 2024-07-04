import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup

- doppelung variablen nicht benutzt - 2 mal

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -20
Testumfang: 62,5

 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const existingUsers = [
        { name: 'Existing User', email: 'existing@test.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
    ];

    const renderForm = () => render(<AddUserFormLeicht setUsers={mockSetUsers} users={existingUsers} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show entered values and add a new user', async () => {
        renderForm();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@test.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        await userEvent.type(departmentInput, 'Engineering');
        await userEvent.click(addUserButton);

        expect(nameInput).toHaveValue('New User');
        expect(emailInput).toHaveValue('new@test.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.EMPLOYEE);
        expect(departmentInput).toHaveValue('Engineering');
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...existingUsers,
            {
                name: 'New User',
                email: 'new@test.com',
                password: 'Password123!',
                role: USER_ROLE.EMPLOYEE,
                department: 'Engineering',
            },
        ]);
    });

    // ...more tests for different scenarios...

    it('should show an error if the email is already taken', async () => {
        renderForm();

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'existing@test.com'); // Already exists

        const addUserButton = screen.getByText('Add User');
        await userEvent.click(addUserButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should show errors for invalid passwords', async () => {
        renderForm();
        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByText('Add User');

        // Test with a password that's too short
        await userEvent.type(passwordInput, 'short');
        await userEvent.click(addUserButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();

        // Clear the input
        await userEvent.clear(passwordInput);

        // Test with a password that doesn't meet other requirements
        await userEvent.type(passwordInput, 'nopassword');
        await userEvent.click(addUserButton);
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();

        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should hide the department field for CUSTOMER role', async () => {
        renderForm();

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
