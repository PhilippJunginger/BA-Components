import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- critical: render in beforeEach
- critical: waitFor instead of findBy

- clean code: keine variablen erstellt - 5 mal

- 4 von 7 notwendigen Testumfang erreicht + 1 Ausnahme + 4 Redundanz


Best-Practices: -30
CleanCode: -25
Testumfang: 28,6
*/

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const mockUsers = [];

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
        await user.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
    });

    it('should show entered value in the email field', async () => {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it('should show entered value in the password field and display password errors', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'weak');
        expect(passwordInput).toHaveValue('weak');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should change value of select field', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department field when role is not CUSTOMER', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not show department field when role is CUSTOMER', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should display error if email is already taken', async () => {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'existing@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        await screen.findByText('Es ist ein Fehler aufgetreten!');
    });

    it('should call setUsers with new user on successful form submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'StrongP@ssw0rd');
        await user.click(roleSelect);
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() =>
            expect(mockSetUsers).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: 'John Doe',
                        email: 'john.doe@example.com',
                        role: USER_ROLE.ADMIN,
                        password: 'StrongP@ssw0rd',
                    }),
                ]),
            ),
        );
    });
});
