import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*

- unused import
- clean code: doppelung von userEvent.setup()
- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: 0
CleanCode: -20
Testumfang: 50,1
*/

// Mocking fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
    }),
) as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const setUsers = jest.fn();
    const initialUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    beforeEach(() => {
        setUsers.mockClear();
        (fetch as jest.Mock).mockClear();
    });

    it.skip('should render component with initial elements', () => {
        render(<AddUserFormMittel users={initialUsers} setUsers={setUsers} />);

        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should handle input changes', async () => {
        render(<AddUserFormMittel users={initialUsers} setUsers={setUsers} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(nameInput, 'Jane Smith');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password1!');

        expect(nameInput).toHaveValue('Jane Smith');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('Password1!');
    });

    it('should display password error messages', async () => {
        render(<AddUserFormMittel users={initialUsers} setUsers={setUsers} />);
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(passwordInput, 'short');

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should handle form submission successfully', async () => {
        render(<AddUserFormMittel users={initialUsers} setUsers={setUsers} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'Jane Smith');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await user.click(submitButton);

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(setUsers).toHaveBeenCalledWith([
                ...initialUsers,
                expect.objectContaining({
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password1!',
                }),
            ]),
        );
    });

    it('should display error when email is already taken', async () => {
        render(<AddUserFormMittel users={initialUsers} setUsers={setUsers} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it('should close error alert', async () => {
        render(<AddUserFormMittel users={initialUsers} setUsers={setUsers} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        const closeButton = screen.getByLabelText(/close-icon/i);
        await user.click(closeButton);

        expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
    });
});
