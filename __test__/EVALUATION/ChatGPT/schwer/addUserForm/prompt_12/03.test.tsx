import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*



- clean code: keine variablen erstellt - 3 mal
- unnötige waitFor - 3 mal

- 3 von 7 notwendigen Testumfang erreicht + 4 Redundanz


Best-Practices: -20
CleanCode: -30
Testumfang: 14,3
*/

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
    ];

    beforeEach(() => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('should render form elements correctly', () => {
        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should show entered values in text fields', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should change value of select field', async () => {
        const roleSelect = screen.getByLabelText(/role/i);

        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages', async () => {
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(passwordInput, 'short');

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('should show error alert if email is already taken', async () => {
        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    it('should call setUsers with new user on successful submission', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
        });
    });

    it('should hide error alert when close icon is clicked', async () => {
        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText(/close-icon/i);
        await user.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
