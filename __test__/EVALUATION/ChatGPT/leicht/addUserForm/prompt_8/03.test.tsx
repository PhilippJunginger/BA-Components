import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: Verwendung von fireEvent

- keine Verwendung von Variablen, um setCall zu testen mit den Eingabedaten

- 3 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanzen

Best-Practices: -10
CleanCode: -5
Testumfang: 50
 */

describe('AddUserFormLeicht Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [];

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render form fields correctly', () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should show entered value in the name field', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should show entered value in the email field', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane.doe@example.com');
        expect(emailInput).toHaveValue('jane.doe@example.com');
    });

    it('should show entered value in the password field', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should change value of select field', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error if email already exists', async () => {
        const existingUsers: User[] = [
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={existingUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'john.doe@example.com');
        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error if password does not meet criteria', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'pass');
        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should call setUsers with new user if form is valid', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);
    });
});
