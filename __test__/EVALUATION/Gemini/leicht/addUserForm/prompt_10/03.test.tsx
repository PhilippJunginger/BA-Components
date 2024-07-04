import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*


- doppelung userEvent setup
- doppelung variablen - 2

- 3 von 4 notwendigem Testumfang erreicht


Best-Practices: -10
CleanCode: -15
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a valid user', async () => {
        const user = userEvent.setup();

        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        // Fill in form fields with valid data
        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPassword1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        // Assertions
        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'John Doe', email: 'john@example.com', password: 'ValidPassword1!', role: USER_ROLE.ADMIN },
        ]);
        // Ensure error states are cleared after successful submission
        expect(screen.queryByText('Email already exists!')).not.toBeInTheDocument();
    });

    it('should show email error for duplicate email', async () => {
        const user = userEvent.setup();
        mockUsers.push({
            name: 'Existing User',
            email: 'john@example.com',
            password: 'ValidPassword1!',
            role: USER_ROLE.ADMIN,
        });

        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        // Fill in form with existing email
        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com'); // Duplicate email
        await user.type(screen.getByLabelText('Password'), 'ValidPassword1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        // Assertions
        expect(mockSetUsers).not.toHaveBeenCalled();
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error for invalid password', async () => {
        const user = userEvent.setup();

        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        // Fill in form with invalid password
        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'invalid'); // Invalid password
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        // Assertions
        expect(mockSetUsers).not.toHaveBeenCalled();
        // Ensure password error messages are displayed
        const passwordErrorListItems = screen.getAllByRole('listitem');
        expect(passwordErrorListItems.length).toBe(4);
    });

    // Add tests for other scenarios like:
    // - Empty required fields
    // - Department field visibility based on role
    // ...
});
