import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../models/user';

/*
- critical eslint error: userEvent Promise not handled
- critical best-practice: userEvent.setup not used
- critical best-practice: Verwendung von fireEvent
- verwendung von unnötiger render funktion

- 4 von 4 notwendigen Testfällen erreicht + 1 Ausnahme, da Test anderen Test ergänzt + 5 Redundanzen

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -40
CleanCode: -15
Testumfang: 37,5
 */

const mockSetUsers = jest.fn();

const defaultProps = {
    users: [],
    setUsers: mockSetUsers,
};

const renderComponent = (props = {}) => render(<AddUserFormLeicht {...defaultProps} {...props} />);

describe('AddUserFormLeicht Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        renderComponent();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByText(/add user/i)).toBeInTheDocument();
    });

    it('handles name input change', () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/name/i);
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        expect(nameInput).toHaveValue('John Doe');
    });

    it('handles email input change', () => {
        renderComponent();
        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        expect(emailInput).toHaveValue('john@example.com');
    });

    it('handles password input change', () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        expect(passwordInput).toHaveValue('Password123!');
    });

    it.skip('handles role selection change', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it.skip('shows department input when role is not customer', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it.skip('does not show department input when role is customer', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it.skip('handles form submission with valid data', async () => {
        renderComponent({
            users: [
                {
                    name: 'Existing User',
                    email: 'existing@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'Password123!',
                },
            ],
        });

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'Existing User',
                email: 'existing@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password123!',
            },
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ]);
    });

    it.skip('shows error message when email is already taken', () => {
        renderComponent({
            users: [
                {
                    name: 'Existing User',
                    email: 'existing@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'Password123!',
                },
            ],
        });

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/email already exists!/i)).toBeInTheDocument();
    });

    it('shows password error message for invalid password', () => {
        renderComponent();
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'invalid' } });
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });
});
