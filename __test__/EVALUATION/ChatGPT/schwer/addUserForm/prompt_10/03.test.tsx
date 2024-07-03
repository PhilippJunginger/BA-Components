import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: userEvent.setup fehtl


- clean code: keine variablen erstellt - 3 mal
- unnötige waitFor - 4 mal
- unnötige constant

- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -30
Testumfang: 50,05
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const mockRouterPush = jest.fn();
    const initialUsers: User[] = [];
    const setUsers = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
            query: {},
        });
    });

    const setup = () => {
        return render(<AddUserFormSchwer users={initialUsers} setUsers={setUsers} />);
    };

    test('should render form fields correctly', () => {
        setup();

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('should show password errors', async () => {
        setup();
        const passwordInput = screen.getByLabelText(/password/i);

        await userEvent.type(passwordInput, 'weak');
        await screen.findByText(/password needs to be 8 characters long/i);
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('should submit the form successfully', async () => {
        setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password1!');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith([
                { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ]);
        });
    });

    test('should show error if email already exists', async () => {
        render(
            <AddUserFormSchwer
                users={[
                    {
                        name: 'Existing User',
                        email: 'existing@example.com',
                        role: USER_ROLE.ADMIN,
                        password: 'Password1!',
                    },
                ]}
                setUsers={setUsers}
            />,
        );
        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'existing@example.com');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
        });
    });

    test.skip('should route to user page after adding user if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
            query: { shouldRoute: 'true' },
        });

        setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password1!');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/users?id=mockedUserId');
        });
    });
});
