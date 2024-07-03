import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: userEvent.setup nicht verwendet
- critical: fireEvent verwendet
- critical render in beforeEach
- cirtical: promises not handled
- critical: assertiions waitFor

- clean code: keine variablen erstellt - 3 mal
- TypeError
- unnötige waitFor - 4 mal

- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -50
CleanCode: -40
Testumfang: 50,05
*/

// Mocking the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const setUsersMock = jest.fn();
    const usersMock = [];
    const pushMock = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: {},
            push: pushMock,
        });

        render(<AddUserFormSchwer users={usersMock} setUsers={setUsersMock} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form elements correctly', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('validates and displays password error messages', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);

        await userEvent.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
            expect(
                screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    it.skip('submits the form with correct input', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledTimes(1);
        });
    });

    it.skip('shows error when email is already taken', async () => {
        render(<AddUserFormSchwer users={[{ email: 'john.doe@example.com' }]} setUsers={setUsersMock} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await userEvent.type(emailInput, 'john.doe@example.com');

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it.skip('navigates to the new user page on successful creation', async () => {
        (useRouter as jest.Mock).mockReturnValue({
            query: { shouldRoute: 'true' },
            push: pushMock,
        });

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('http://localhost:3000/users?id=newUserId');
        });
    });
});
