import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { User } from '../../../../../../models/user';

/*
- critical: kein userEvent.setup

- doppelung variablen nicht benutzt - 2 mal

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -10
Testumfang: 62,5

 */

// Mock for setUsers prop
const mockSetUsers = jest.fn();

describe('AddUserFormLeicht Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('displays email error message when email is already taken', async () => {
        const existingUsers: User[] = [
            { name: 'Existing User', email: 'existing@test.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ];
        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'existing@test.com');

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('displays password error message when password does not meet requirements', async () => {
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'weakpassword'); // Doesn't meet the criteria

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('adds a new user with valid data and clears the form', async () => {
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'New User');

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'new@test.com');

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Password123!');

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE); // Select 'Employee'

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'New User', email: 'new@test.com', role: USER_ROLE.EMPLOYEE, password: 'Password123!' },
        ]);

        expect(nameInput).toHaveValue(''); // Form is cleared after submission
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
    });

    // Additional tests...
    // Test that department field appears for Admin/Employee roles
    // Test error handling when required fields are empty
    // Test role-specific form behavior (e.g., department visibility)
});
