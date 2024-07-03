import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: fireEvent verwendet

- clean code: keine variablen erstellt - 3 mal
- TypeError

- 3 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -10
CleanCode: -20
Testumfang: 28,6
*/

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('shows entered value in text fields', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('changes role selection', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await user.click(screen.getByLabelText('Role'));
        await user.selectOptions(screen.getByRole('listbox'), screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.ADMIN);
    });

    it('displays password validation errors', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('displays error message if email is already taken', async () => {
        const existingUsers = [{ name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.CUSTOMER }];
        render(<AddUserFormSchwer users={existingUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const form = screen.getByRole('form');

        await user.type(emailInput, 'jane.doe@example.com');
        fireEvent.submit(form);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('adds a new user on valid submission', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const form = screen.getByRole('form');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        fireEvent.submit(form);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ]);
    });
});
