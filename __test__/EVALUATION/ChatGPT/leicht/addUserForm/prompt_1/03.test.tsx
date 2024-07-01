import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../models/user';
import AddUserFormLeicht from '../../../../../components/leicht/addUserFormLeicht';

/*
- critical eslint error: userEvent Promise not handled
- critical best-practice: userEvent.setup not used
- critical best-practice: Verwendung von fireEvent
- 2-mal unnötige variablen erstellt

- 4 von 4 notwendigen Testfälen erreicht + 3 Redundanzen

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -30
CleanCode: -10
Testumfang: 62.5
 */

// Mock props
const mockSetUsers = jest.fn();
const mockUsers = [
    { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
];

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders form elements correctly', () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test.skip('handles input changes correctly', () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        expect(nameInput).toHaveValue('New User');

        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
        expect(emailInput).toHaveValue('new@example.com');

        fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
        expect(passwordInput).toHaveValue('Password1!');

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test('displays password validation error', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.change(passwordInput, { target: { value: 'weakpass' } });
        await userEvent.click(submitButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test('displays email already exists error', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
        await userEvent.click(submitButton);

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test.skip('adds a new user successfully', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });

        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'New User', email: 'new@example.com', role: USER_ROLE.EMPLOYEE, password: 'Password1!' },
        ]);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    test.skip('shows department field when role is not customer', () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not show department field when role is customer', () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
