import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: render in beforeEach

- unnecessary waitFor
- clean code: keine variablen erstellt - 5 mal

- 4 von 7 notwendigen Testumfang erreicht + 1 Ausnahme + 4 Redundanz


Best-Practices: -10
CleanCode: -30
Testumfang: 28,6
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

    it('should show entered name value', async () => {
        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'Jane');
        expect(nameInput).toHaveValue('Jane');
    });

    it('should show entered email value', async () => {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should show entered password value and display password errors', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');
        expect(passwordInput).toHaveValue('short');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('should change value of select field', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department field when role is not CUSTOMER', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not show department field when role is CUSTOMER', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should display error if email is already taken', async () => {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'john@example.com');
        await user.click(screen.getByRole('button', { name: /Add User/i }));
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('should call setUsers with new user on successful form submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
        });
    });
});
