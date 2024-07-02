import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { User } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: Verwendung von fireEvent
- critical: promises not handled from userEvent

- clean code: setUsers jedesmal neu erstellt statt jest.clearAllMocks() in beforeEach
- clean-code: unnötiges Variable userMock
- keine Verwendung von Variablen, um setCall zu testen mit den Eingabedaten

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 1 Redundanzen

Best-Practices: -20
CleanCode: -15
Testumfang: 87,5
 */

describe('AddUserFormLeicht', () => {
    let setUsersMock: jest.Mock;
    let usersMock: User[];

    beforeEach(() => {
        setUsersMock = jest.fn();
        usersMock = [];
    });

    test('renders form fields correctly', () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={usersMock} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test.skip('displays error when email already exists', async () => {
        usersMock = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' }];
        render(<AddUserFormLeicht setUsers={setUsersMock} users={usersMock} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
        expect(setUsersMock).not.toHaveBeenCalled();
    });

    test.skip('displays password error when password is invalid', async () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={usersMock} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'password');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(setUsersMock).not.toHaveBeenCalled();
    });

    test.skip('adds user when form is valid', async () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={usersMock} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsersMock).toHaveBeenCalledWith([
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ]);
    });

    test.skip('displays department field when role is not customer', async () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={usersMock} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not display department field when role is customer', async () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={usersMock} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
