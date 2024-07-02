import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: keine Verwendung von userEvent.setup()

- unused import
- unnecessary render Funktion
- clean code: Doppelung - keine variablen erstellt - 2 mal



- 4 von 6 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -20
Testumfang: 58,45
*/

describe('AddUserFormMittel Component', () => {
    const initialUsers: User[] = [];

    const setup = () => {
        const setUsers = jest.fn();
        render(<AddUserFormMittel users={initialUsers} setUsers={setUsers} />);
        return { setUsers };
    };

    it('should render the form fields correctly', () => {
        setup();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    it('should show password validation errors', async () => {
        setup();
        const passwordInput = screen.getByLabelText(/Password/i);

        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('should not submit the form if email is already taken', async () => {
        const { setUsers } = setup();
        initialUsers.push({
            name: 'John Doe',
            email: 'john@example.com',
            role: USER_ROLE.EMPLOYEE,
            password: 'Password123!',
        });

        const emailInput = screen.getByLabelText(/Email/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.click(submitButton);

        expect(setUsers).not.toHaveBeenCalled();
        expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should add a new user correctly', async () => {
        const { setUsers } = setup();

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await userEvent.click(submitButton);

        await waitFor(() =>
            expect(setUsers).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: 'Jane Doe',
                        email: 'jane@example.com',
                        role: USER_ROLE.ADMIN,
                    }),
                ]),
            ),
        );
    });

    it.skip('should handle server error correctly', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Error' }),
            } as Response),
        );

        const { setUsers } = setup();

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await userEvent.click(submitButton);

        await screen.findByText(/Es ist ein Fehler aufgetreten!/i);
        expect(setUsers).not.toHaveBeenCalled();
    });
});
