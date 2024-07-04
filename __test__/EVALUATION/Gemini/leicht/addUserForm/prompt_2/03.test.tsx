import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- doppelung userEvent.setup
- clean code: Doppelung - keine variablen - 2 mal

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: 0
CleanCode: -15
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const initialUsers = [
        { name: 'Existing User', email: 'existing@email.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[]} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument(); // Hidden initially
    });

    it('adds a new user with valid data', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText('Name'), 'New User');
        await user.type(screen.getByLabelText('Email'), 'new@email.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        await user.type(screen.getByLabelText('Department'), 'Sales'); // Should be visible now
        await user.click(screen.getByText('Add User'));

        const expectedNewUser = {
            name: 'New User',
            email: 'new@email.com',
            password: 'Password123!',
            role: USER_ROLE.EMPLOYEE,
            department: 'Sales',
        };
        expect(mockSetUsers).toHaveBeenCalledWith([...initialUsers, expectedNewUser]);
    });

    it('shows error for duplicate email', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText('Email'), 'existing@email.com'); // Duplicate email
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error for invalid password', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText('Password'), 'short'); // Invalid password
        await user.click(screen.getByText('Add User'));

        // Check for specific error messages (adjust if needed)
        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });
});
