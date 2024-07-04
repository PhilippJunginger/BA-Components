import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent,setup fehtl

- doppelung variablen - 2

- 2 von 4 notwendigem Testumfang erreicht


Best-Practices: -10
CleanCode: -10
Testumfang: 50
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const initialUsers = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should add a new user with valid data', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department'); // This will appear when role is not CUSTOMER
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        // Simulate user input
        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.type(departmentInput, 'IT');
        await userEvent.click(submitButton);

        // Assertions
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            {
                name: 'New User',
                email: 'new@example.com',
                role: USER_ROLE.ADMIN,
                password: 'NewPassword123!',
                department: 'IT',
            },
        ]);
        // Ensure form fields are cleared after successful submission
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
    });

    it('should show errors for invalid email and password', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        // Simulate invalid inputs
        await userEvent.type(emailInput, 'existing@example.com'); // Already existing email
        await userEvent.type(passwordInput, 'weak'); // Weak password
        await userEvent.click(submitButton);

        // Assertions
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled(); // User should not be added
    });

    // Add more tests for:
    // - Not filling required fields
    // - Different roles and their impact on the form (e.g., no department for CUSTOMER)
    // - Edge cases of the password validation
});
