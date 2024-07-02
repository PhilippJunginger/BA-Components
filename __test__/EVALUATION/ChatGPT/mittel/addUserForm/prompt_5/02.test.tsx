import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical: keine Verwendung von userEvent.setup()
- critical: promise not handled
- critical: Verwendung von fireEvent
- critical: render in beforeEach

- clean code: setUserMock in beforeEach neue Zuweisung statt clearAllMocks()
- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal


- 5 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 1 Redundanz


Best-Practices: -40
CleanCode: -15
Testumfang: 75,15
*/

const initialUsers: User[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
];

describe('AddUserFormMittel', () => {
    let setUsersMock: jest.Mock;

    beforeEach(() => {
        setUsersMock = jest.fn();
        render(<AddUserFormMittel users={initialUsers} setUsers={setUsersMock} />);
    });

    test('renders form elements correctly', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('shows password requirements errors', async () => {
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'weakpass');

        fireEvent.blur(passwordInput);

        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('displays error if email is already taken', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
    });

    test.skip('allows valid form submission', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(setUsersMock).toHaveBeenCalled());
    });

    test.skip('renders department field when role is ADMIN or EMPLOYEE', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field when role is CUSTOMER', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test('closes error alert when close icon is clicked', async () => {
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        const errorAlert = await screen.findByText(/es ist ein fehler aufgetreten/i);
        expect(errorAlert).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText(/close-icon/i));
        expect(errorAlert).not.toBeInTheDocument();
    });
});
