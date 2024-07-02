import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- critical: Kein instantiierung von userEvent.setup()

- clean code: sehr komplizierte render Funktion erstellt

- 4 von 4 notwendigem Testumfang erreicht + 1 Redundanzen

Best-Practices: -20
CleanCode: -10
Testumfang: 87.5
 */

const mockSetUsers = jest.fn();

const renderComponent = (props = {}) => {
    const defaultProps = {
        setUsers: mockSetUsers,
        users: [],
        ...props,
    };

    return render(<AddUserFormLeicht {...defaultProps} />);
};

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form fields correctly', () => {
        renderComponent();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('shows error when password does not meet criteria', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/password/i);
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'weakpass');
        fireEvent.click(addUserButton);

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('shows error when email is already taken', async () => {
        renderComponent({
            users: [{ name: 'Existing User', email: 'test@example.com', role: USER_ROLE.ADMIN, password: 'Valid123!' }],
        });
        const emailInput = screen.getByLabelText(/email/i);
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'test@example.com');
        fireEvent.click(addUserButton);

        expect(screen.getByText(/email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('adds a new user when form is filled out correctly', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Valid123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        fireEvent.click(addUserButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Valid123!' },
        ]);
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it.skip('conditionally renders department field based on role', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });
});
