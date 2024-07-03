import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: render in beforeEach
- critical: waitFor instead of findBy

- clean code: keine variablen erstellt - 5 mal

- 3 von 7 notwendigen Testumfang erreicht + 5 Redundanz


Best-Practices: -20
CleanCode: -25
Testumfang: 7,15
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

    it('should render the form with initial values', () => {
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('should show entered value in the name field', async () => {
        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should show entered value in the email field', async () => {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should show entered value in the password field', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should change value of select field', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'pass');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should show error if email is already taken', async () => {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'john@example.com');
        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(submitButton);
        await screen.findByText('Es ist ein Fehler aufgetreten!');
    });

    it('should call setUsers with new user on successful submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.click(submitButton);

        await waitFor(() =>
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]),
        );
    });
});
