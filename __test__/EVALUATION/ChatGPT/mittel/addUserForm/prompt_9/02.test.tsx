import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- critical: promises not handled

- unnecessary awaitong of element
- clean code: Doppelung - keine variablen erstellt
- clean code: Doppellung screen....

- TypeErrpr global fetch
- 5 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 1 Redundanz


Best-Practices: -20
CleanCode: -15
Testumfang: 75,15
*/

describe('AddUserFormMittel Component', () => {
    const setUsersMock = jest.fn();
    const initialUsers = [];

    const renderComponent = () => render(<AddUserFormMittel setUsers={setUsersMock} users={initialUsers} />);

    beforeEach(() => {
        setUsersMock.mockClear();
    });

    test('renders form elements', () => {
        renderComponent();

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('displays password validation errors', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(passwordInput, 'short');
        expect(await screen.findByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('displays error alert if email is already taken', async () => {
        const existingUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        const usersWithExistingEmail = [existingUser];
        render(<AddUserFormMittel setUsers={setUsersMock} users={usersWithExistingEmail} />);

        await userEvent.type(screen.getByLabelText('Email'), existingUser.email);
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    test('creates new user when form is filled out correctly', async () => {
        renderComponent();

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        // Assuming createUser is a successful mock function
        await screen.findByText('Create new User');

        expect(setUsersMock).toHaveBeenCalledTimes(1);
        expect(setUsersMock).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    test('displays department field for Admin and Employee roles', async () => {
        renderComponent();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(await screen.findByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);

        expect(await screen.findByLabelText('Department')).toBeInTheDocument();
    });

    test('does not display department field for Customer role', async () => {
        renderComponent();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    test('closes error alert when close button is clicked', async () => {
        const existingUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        const usersWithExistingEmail = [existingUser];
        render(<AddUserFormMittel setUsers={setUsersMock} users={usersWithExistingEmail} />);

        await userEvent.type(screen.getByLabelText('Email'), existingUser.email);
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        const errorAlert = await screen.findByText('Es ist ein Fehler aufgetreten!');
        expect(errorAlert).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('close-icon'));
        expect(errorAlert).not.toBeInTheDocument();
    });
});
