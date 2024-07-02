import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: Verwendung von fireEvent

- keine Verwendung von Variablen, um setCall zu testen mit den Eingabedaten

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanzen

Best-Practices: -10
CleanCode: -5
Testumfang: 75
 */

describe('AddUserFormLeicht Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [];

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render the form with initial values', () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('should update the name field when typed into', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
    });

    it('should show error if email already exists', async () => {
        const existingUsers: User[] = [
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={existingUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error if password does not meet criteria', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'weakpass');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should add a new user when form is submitted with valid data', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ]);
    });

    it('should show department field if role is ADMIN or EMPLOYEE', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not show department field if role is CUSTOMER', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
