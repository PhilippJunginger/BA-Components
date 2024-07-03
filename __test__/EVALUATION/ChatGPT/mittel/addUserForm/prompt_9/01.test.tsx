import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- very critical: Verwendung von fireEvent
- critical: too many assertions waitFor
- critical: promises not handled

- clean code: Doppelung - keine variablen erstellt - 3 mal

- TypeError global fetch


- 4 von 6 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -20
Testumfang: 50,1
*/

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
    }),
);

describe('AddUserFormMittel Component', () => {
    const setUsers = jest.fn();
    const initialUsers: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the form correctly', () => {
        render(<AddUserFormMittel setUsers={setUsers} users={initialUsers} />);

        expect(screen.getByText(/Create new User/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test.skip('handles input changes correctly', async () => {
        render(<AddUserFormMittel setUsers={setUsers} users={initialUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');

        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), screen.getByRole('option', {name: USER_ROLE.ADMIN}));

        expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('Password123!');
        expect(screen.getByLabelText(/Role/i)).toHaveValue(USER_ROLE.ADMIN);
    });

    test('shows password error messages correctly', async () => {
        render(<AddUserFormMittel setUsers={setUsers} users={initialUsers} />);

        await userEvent.type(screen.getByLabelText(/Password/i), 'Pass');

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('displays error when email is already taken', async () => {
        const test =  {
                name: 'Existing User',
                email: 'existing@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        render(
            <AddUserFormMittel
                setUsers={setUsers}
                users={[
                   test
                ]}
            />,
        );

        await userEvent.type(screen.getByLabelText(/Name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), test.email);
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    test.skip('submits the form and resets on success', async () => {
        render(<AddUserFormMittel setUsers={setUsers} users={initialUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledTimes(1);
            expect(setUsers).toHaveBeenCalledWith([
                { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
            expect(screen.getByLabelText(/Name/i)).toHaveValue('');
            expect(screen.getByLabelText(/Email/i)).toHaveValue('');
            expect(screen.getByLabelText(/Password/i)).toHaveValue('');
            expect(screen.getByLabelText(/Role/i)).toHaveValue('');
        });
    });

    test.skip('displays error alert on API error', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({}),
                status: 400,
            }),
        );

        render(<AddUserFormMittel setUsers={setUsers} users={initialUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });
});
