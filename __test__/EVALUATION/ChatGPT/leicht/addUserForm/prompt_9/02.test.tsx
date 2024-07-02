import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: not handling promises from UserEvent
- critical: not using userEvent.setup()
- minor: creating setUserMock new every test instead of jest.clearAllMocks()
- critical: Verwendung von render in beforeEach

- clean code: Keine Variable benutzt für Prüfung von Eingaben - 2 mal
- unused import

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redundanzen

Best-Practices: -35
CleanCode: -15
Testumfang: 87,5
 */

const initialUsers: User[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
];

describe('AddUserFormLeicht', () => {
    let setUsersMock: jest.Mock;

    beforeEach(() => {
        setUsersMock = jest.fn();
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);
    });

    test('renders form fields correctly', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByText(/Add User/i)).toBeInTheDocument();
    });

    test('displays password validation error', async () => {
        await userEvent.type(screen.getByLabelText(/Password/i), 'short');
        await userEvent.click(screen.getByText(/Add User/i));
        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test('displays email already exists error', async () => {
        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.click(screen.getByText(/Add User/i));
        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with new user data', async () => {
        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane.doe@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        await userEvent.click(screen.getByText(/Add User/i));

        expect(setUsersMock).toHaveBeenCalledWith([
            ...initialUsers,
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);
    });

    test.skip('renders department field for non-customer roles', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field for customer role', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
