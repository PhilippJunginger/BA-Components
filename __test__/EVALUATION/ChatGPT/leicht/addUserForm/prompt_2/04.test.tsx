import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical error: Verwendung von fireEvent
- minor error: setting up userEvent.setup() inside tests instead of once in describe

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 2 Redundanzen

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -15
CleanCode: 0
Testumfang: 75
 */

describe('AddUserFormLeicht Component', () => {
    const initialUsers: User[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Pass@123' },
    ];
    const mockSetUsers = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders form elements correctly', () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test.skip('handles input changes correctly', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'Password@123');
        expect(passwordInput).toHaveValue('Password@123');

        const roleSelect = screen.getByLabelText(/Role/i);
        fireEvent.mouseDown(roleSelect);
        const roleOption = await screen.findByText(USER_ROLE.ADMIN);
        fireEvent.click(roleOption);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test.skip('shows error message if email already exists', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password@123');
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test('shows password error if password does not meet criteria', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Password/i), 'password');
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('calls setUsers with new user on successful form submission', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password@123');
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.EMPLOYEE);

        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE, password: 'Password@123' },
        ]);
    });

    test.skip('renders department field when role is ADMIN or EMPLOYEE', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);
        const user = userEvent.setup();

        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field when role is CUSTOMER', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);
        const user = userEvent.setup();

        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
