import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: fireEvent
- userEvent.setup

- TypeError
- doppelung variablen nicht benutzt - 2 mal

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -10
Testumfang: 62,5

 */

describe('AddUserFormLeicht Component', () => {
    const mockSetUsers = jest.fn();
    const initialUsers = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all form fields correctly', () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        // Check if all required fields are present
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();

        // Initial state for 'Department' field
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should show validation errors for invalid password', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'invalid'); // Invalid password

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        // Check if password error message is displayed
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('should show error when email is already taken', async () => {
        const existingUser = {
            name: 'John Doe',
            email: 'john@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        await user.type(screen.getByLabelText('Email'), 'john@example.com'); // Use the existing email

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        // Check if email error message is displayed
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should add a new user when form is valid', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText('Name'), 'Alice');
        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');

        // Choose a role
        await user.selectOptions(screen.getByRole('combobox'), 'ADMIN');

        // Department should be visible now
        const departmentInput = screen.getByLabelText('Department');
        await user.type(departmentInput, 'Engineering');

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        // Expect setUsers to have been called with the new user data
        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'Alice',
                email: 'alice@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
                department: 'Engineering',
            },
        ]);

        // Expect form to reset
        expect(screen.getByLabelText('Name')).toHaveValue('');
        // ...and so on for other fields
    });
});
