import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: render in beforeEach
- critical: too many assertions in waitFor

- clean code: Doppelung - keine variablen erstellt - 4 mal



- 4 von 6 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: -20
CleanCode: -20
Testumfang: 41,75
*/

describe('AddUserFormMittel Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('should display entered name value', async () => {
        const nameInput = screen.getByLabelText('Name');

        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should display entered email value', async () => {
        const emailInput = screen.getByLabelText('Email');

        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should display entered password value and show error messages', async () => {
        const passwordInput = screen.getByLabelText('Password');

        await user.type(passwordInput, 'short');
        expect(passwordInput).toHaveValue('short');

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            expect(
                screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
            ).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
        });
    });

    it('should select role from dropdown', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display department field when role is not customer', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should show error message if email is already taken', async () => {
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('should call setUsers with new user on successful submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password1!',
                },
            ]);
        });
    });
});
