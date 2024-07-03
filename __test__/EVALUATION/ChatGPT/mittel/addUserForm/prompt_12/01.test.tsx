import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
-critical: render in beforeEach

- unused import
- clean code: keine variablen erstellt - 2 mal
- clean code: doppelung screen...


- 5 von 6 notwendigen Testumfang erreicht + 1 Ausnahme +  2 Redundanz


Best-Practices: -10
CleanCode: -20
Testumfang: 66,8
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

    it('should render the form fields correctly', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    it('should show password error messages when password is invalid', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);

        await user.type(passwordInput, 'short');
        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('should not submit the form if password is invalid', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(passwordInput, 'short');
        await user.click(submitButton);

        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should show error alert if email is already taken', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should call setUsers with new user when form is valid', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    it.skip('should show department field when role is ADMIN or EMPLOYEE', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it.skip('should hide department field when role is CUSTOMER', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });

    it('should close error alert when close icon is clicked', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        const closeButton = screen.getByLabelText(/close-icon/i);
        await user.click(closeButton);

        expect(screen.queryByText(/Es ist ein Fehler aufgetreten!/i)).not.toBeInTheDocument();
    });
});
