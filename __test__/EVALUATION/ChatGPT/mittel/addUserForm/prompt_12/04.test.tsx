import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
-critical: render in beforeEach

- unused import
- clean code: keine variablen erstellt - 5 mal

- 4 von 6 notwendigen Testumfang erreicht + 1 Ausnahme +  6 Redundanz


Best-Practices: -10
CleanCode: -30
Testumfang: 16,7
*/

describe('AddUserFormMittel Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it.skip('should render the form with initial values', () => {
        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });

    it('should update the name field on change', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should update the email field on change', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should update the password field on change and show error messages for invalid password', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');
        expect(passwordInput).toHaveValue('short');
        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it.skip('should update the role field on change', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department field when role is not customer', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should not show department field when role is customer', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });

    it('should show error alert when email is already taken', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john@example.com');
        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(submitButton);
        expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should call setUsers with new user on successful form submission', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    it.skip('should clear the form after successful submission', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(submitButton);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('should close the error alert when close icon is clicked', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john@example.com');
        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(submitButton);

        const closeButton = screen.getByLabelText(/close-icon/i);
        await user.click(closeButton);

        expect(screen.queryByText(/Es ist ein Fehler aufgetreten!/i)).not.toBeInTheDocument();
    });
});
