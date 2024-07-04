import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- doppelung userEvent.setup
- doppelung screen

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: 0
CleanCode: -10
Testumfang: 87,5
 */

describe('AddUserFormLeicht Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all form fields correctly', () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('validates password requirements and displays error messages', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'invalid');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('validates email uniqueness and displays error message', async () => {
        const user = userEvent.setup();
        const existingUser: User = {
            name: 'John Doe',
            email: 'john@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, existingUser.email);
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('adds a new user with valid data', async () => {
        const user = userEvent.setup();
        const newUser: User = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department'); // This input is conditionally rendered

        await user.type(nameInput, newUser.name);
        await user.type(emailInput, newUser.email);
        await user.type(passwordInput, newUser.password);
        await user.selectOptions(roleSelect, newUser.role);
        await user.type(departmentInput, 'Sales'); // Fill in the department if applicable

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledWith([newUser]);
    });

    it('shows the department field for admin and employee roles', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
