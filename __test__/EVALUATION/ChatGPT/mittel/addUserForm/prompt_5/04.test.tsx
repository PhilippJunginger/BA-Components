import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: keine Verwendung von userEvent.setup()
- critical: promise not handled
- critical: Verwendung von fireEvent
- critical: render in beforeEach

- clean code: Doppelung - keine variablen erstellt
- unnecessary await findByText - 3 mal


- 4 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 2 Redundanz


Best-Practices: -40
CleanCode: -20
Testumfang: 50,1
*/

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [
        { name: 'Existing User', email: 'existinguser@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the form correctly', () => {
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('displays error when trying to add a user with an existing email', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/email/i), 'existinguser@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
    });

    test('displays password error when password does not meet criteria', async () => {
        await userEvent.type(screen.getByLabelText(/password/i), 'short');

        fireEvent.blur(screen.getByLabelText(/password/i)); // trigger validation

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('calls createUser and setUsers when form is valid and submitted', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({}),
                status: 200,
            }),
        ) as jest.Mock;

        await userEvent.type(screen.getByLabelText(/name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/email/i), 'newuser@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText('Create new User')).toBeInTheDocument(); // verify form reset
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password1!',
            },
        ]);
    });

    test.skip('displays department field when role is not customer', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test.skip('hides department field when role is customer', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test.skip('resets form after successful submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({}),
                status: 200,
            }),
        ) as jest.Mock;

        await userEvent.type(screen.getByLabelText(/name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/email/i), 'newuser@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });
});
