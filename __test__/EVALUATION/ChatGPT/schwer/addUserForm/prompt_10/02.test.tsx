import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: fireEvent verwendet
- crizical: assertions waitFor

- clean code: keine variablen erstellt - 3 mal

- 3 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -10
CleanCode: -15
Testumfang: 28,6
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const setUsersMock = jest.fn();
    const usersMock = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' }];

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ query: {} });
    });

    it.skip('should render form elements', () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it.skip('should update input values when typing', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');

        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');

        await user.type(passwordInput, 'Password1!');
        expect(passwordInput).toHaveValue('Password1!');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password error messages', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
            expect(
                screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    it.skip('should display an error message if email is already taken', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const emailInput = screen.getByLabelText(/email/i);
        const form = screen.getByRole('form');

        await user.type(emailInput, 'john@example.com');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
        });
    });

    it.skip('should call setUsers and reset form on successful submission', async () => {
        (global as any).fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ userId: '12345' }),
            }),
        );

        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const form = screen.getByRole('form');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane.doe@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        fireEvent.submit(form);

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledWith([
                ...usersMock,
                { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ]);
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });
});
