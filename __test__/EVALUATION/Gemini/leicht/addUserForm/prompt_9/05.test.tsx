import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup

- doppelung - keine Varuable - 2 mal


- 4 von 4 notwendigem Testumfang erreicht + 1 Redundanzen


Best-Practices: -10
CleanCode: -10
Testumfang: 87,5
 */

describe('AddUserFormLeicht Component', () => {
    const mockSetUsers = jest.fn();
    const users = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all form fields correctly', () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[]} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument(); // Department is not shown initially
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('shows department field for ADMIN and EMPLOYEE roles', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[]} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('adds a new user with valid data', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={users} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...users,
            { name: 'New User', email: 'new@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    it('shows error for duplicate email', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={users} />);

        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error for invalid password', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[]} />);

        await userEvent.type(screen.getByLabelText('Password'), 'invalid'); // Password does not meet criteria
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });
});
