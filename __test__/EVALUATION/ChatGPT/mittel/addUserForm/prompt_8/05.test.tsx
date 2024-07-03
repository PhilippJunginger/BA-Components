import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: render in beforeEach
- critical: too many assertions waitFor

- unused import
- unnecessary waitFor - 2 mal
- clean code: Doppelung - keine variablen erstellt - 4 mal


- 4 von 6 notwendigen Testumfang erreicht + 5 Redundanz


Best-Practices: -20
CleanCode: -35
Testumfang: 25,05
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

    it('should show entered value in the name field', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should show entered value in the email field', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should show entered value in the password field and display error messages for invalid password', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');
        expect(passwordInput).toHaveValue('short');
        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it.skip('should change value of select field', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it.skip('should display department field when role is not customer', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should show error message when email is already taken', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john@example.com');
        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(submitButton);
        expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should call setUsers with new user when form is submitted successfully', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
            ]);
        });
    });

    it.skip('should reset form after successful submission', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });
});
