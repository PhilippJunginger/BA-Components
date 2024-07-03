import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: render in beforeEach
- critical: Verwendung von fireEvent

- TypeError
- clean code: keine variablen erstellt - 4 mal

- 3 von 6 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: -20
CleanCode: -25
Testumfang: 41,75
*/

describe('AddUserFormMittel Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('should render form elements correctly', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it.skip('should update input values correctly', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);

        await user.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should show error alert when email is already taken', async () => {
        const existingUser = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormMittel setUsers={mockSetUsers} users={[existingUser]} />);

        const emailInput = screen.getByLabelText(/Email/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(emailInput, 'jane.doe@example.com');
        await user.click(submitButton);

        expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should call setUsers with new user on successful submission', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await user.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);
    });

    it.skip('should reset form after successful submission', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await user.click(submitButton);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });
});
