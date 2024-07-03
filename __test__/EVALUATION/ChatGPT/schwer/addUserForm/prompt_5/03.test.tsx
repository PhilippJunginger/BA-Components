import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordError } from '../../models/passwordError';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung fireEvent
- critical: too many assertions waitFor

- sehr komplizierte render Funktion
- clean code: keine variablen erstellt - 3 mal
- unused import
- TypeError - 2


- 6 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -35
Testumfang: 78,65
*/

describe('AddUserFormSchwer', () => {
    const setup = (overrides = {}) => {
        const props = {
            setUsers: jest.fn(),
            users: [],
            ...overrides,
        };

        render(<AddUserFormSchwer {...props} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        return {
            ...props,
            nameInput,
            emailInput,
            passwordInput,
            roleSelect,
            submitButton,
        };
    };

    it.skip('renders the form with initial state', () => {
        setup();
        expect(screen.getByText(/create new user/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });

    it.skip('shows password error messages', async () => {
        const { passwordInput } = setup();
        fireEvent.change(passwordInput, { target: { value: 'short' } });

        await waitFor(() => {
            expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
            expect(
                screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    it.skip('disables submit button if password is invalid', async () => {
        const { passwordInput, submitButton } = setup();
        fireEvent.change(passwordInput, { target: { value: 'short' } });

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });
    });

    it.skip('shows error message if email is already taken', async () => {
        const existingUser: User = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password123!',
        };

        const { emailInput, submitButton, setUsers } = setup({ users: [existingUser] });

        fireEvent.change(emailInput, { target: { value: existingUser.email } });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(setUsers).not.toHaveBeenCalled();
            expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it.skip('creates a new user and resets the form', async () => {
        const { nameInput, emailInput, passwordInput, roleSelect, submitButton, setUsers } = setup();

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.USER } });

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith([
                expect.objectContaining({
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                    role: USER_ROLE.USER,
                    password: 'Password123!',
                }),
            ]);
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });

    it.skip('redirects to user page if shouldRoute is true', async () => {
        const routerPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({
            query: { shouldRoute: 'true' },
            push: routerPush,
        });

        const { nameInput, emailInput, passwordInput, roleSelect, submitButton, setUsers } = setup();

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.USER } });

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalled();
            expect(routerPush).toHaveBeenCalledWith(expect.stringContaining('/users?id='));
        });
    });

    it('handles server error during user creation', async () => {
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        );

        const { nameInput, emailInput, passwordInput, roleSelect, submitButton, setUsers } = setup();

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.USER } });

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(setUsers).not.toHaveBeenCalled();
            expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });
});
