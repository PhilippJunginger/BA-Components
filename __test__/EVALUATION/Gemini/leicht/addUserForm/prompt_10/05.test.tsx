import { render, screen } from '@testing-library/react';
import { USER_ROLE } from '../../../../../../models/user';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*


- doppelung userEvent setup
- doppelung variablen - 2

- 2 von 4 notwendigem Testumfang erreicht


Best-Practices: 0
CleanCode: -15
Testumfang: 50
 */

describe('AddUserFormLeicht Component', () => {
    const mockSetUsers = jest.fn();
    const existingUsers = [
        { name: 'Existing', email: 'existing@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a new user with valid data', async () => {
        const user = userEvent.setup();

        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        // Fill in form fields
        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);

        // Submit the form
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        // Assertions
        expect(mockSetUsers).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...existingUsers,
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.EMPLOYEE, password: 'Password123!' },
        ]);
        // Ensure error states are reset after successful submission
        expect(screen.queryByText('Email already exists!')).not.toBeInTheDocument();
    });

    it('should display an error when email is already taken', async () => {
        const user = userEvent.setup();

        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        await user.type(screen.getByLabelText('Email'), 'existing@example.com'); // Use existing email
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    // More tests can be added to cover different scenarios:
});
