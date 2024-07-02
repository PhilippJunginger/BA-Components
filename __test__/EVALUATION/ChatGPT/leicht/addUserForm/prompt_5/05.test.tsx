import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: Kein instantiierung von userEvent.setup()

- clean code: unused import
- clean code: unnötige Variable users
- clean code: jest.fn() jedes mal neu erstellen statt jest.clearAllMocks() zu benutzen

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 1 Redundanzen

Best-Practices: -10
CleanCode: -15
Testumfang: 87.5
 */

describe('AddUserFormLeicht', () => {
    let setUsersMock: jest.Mock;
    let users: User[];

    beforeEach(() => {
        setUsersMock = jest.fn();
        users = [];
    });

    test('renders form fields correctly', () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={users} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('displays password error when invalid password is provided', async () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={users} />);

        await userEvent.type(screen.getByLabelText(/password/i), 'invalidpw');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('displays email error when email already exists', async () => {
        users = [{ name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' }];
        render(<AddUserFormLeicht setUsers={setUsersMock} users={users} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/email already exists!/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with new user when form is valid', async () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={users} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);
    });

    test.skip('renders department field when role is not customer', async () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={users} />);

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field when role is customer', async () => {
        render(<AddUserFormLeicht setUsers={setUsersMock} users={users} />);

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });
});
