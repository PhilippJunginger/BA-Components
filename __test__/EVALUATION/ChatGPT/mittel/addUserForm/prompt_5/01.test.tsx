import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: keine Verwendung von userEvent.setup()
- critical: promise not handled
- critical: multiple assertions in await waitFor

- unnötige render Funktion
- unused import
- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal
- clean code: Doppelung von userEvent.setup()


- 5 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 2 Redundanz


Best-Practices: -30
CleanCode: -25
Testumfang: 66,8
*/

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const users = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    const renderComponent = () => render(<AddUserFormMittel users={users} setUsers={mockSetUsers} />);

    it('renders the form correctly', () => {
        renderComponent();

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('displays password validation errors correctly', async () => {
        renderComponent();

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'weak');

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            expect(
                screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
            ).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
        });
    });

    it('displays email already taken error', async () => {
        renderComponent();

        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('allows adding a user when the form is valid', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ id: 1, ...users[0] }),
            }),
        ) as jest.Mock;

        renderComponent();

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'ValidPassword1!');
        await userEvent.click(screen.getByLabelText('Role'));
        await userEvent.click(screen.getByText(USER_ROLE.CUSTOMER));
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...users,
                { name: 'New User', email: 'new@example.com', role: USER_ROLE.CUSTOMER, password: 'ValidPassword1!' },
            ]);
        });
    });

    it('handles API error gracefully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'API error' }),
            }),
        ) as jest.Mock;

        renderComponent();

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'ValidPassword1!');
        await userEvent.click(screen.getByLabelText('Role'));
        await userEvent.click(screen.getByText(USER_ROLE.CUSTOMER));
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('resets the form after successful submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ id: 1, ...users[0] }),
            }),
        ) as jest.Mock;

        renderComponent();

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'ValidPassword1!');
        await userEvent.click(screen.getByLabelText('Role'));
        await userEvent.click(screen.getByText(USER_ROLE.CUSTOMER));
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(screen.getByLabelText('Email')).toHaveValue('');
            expect(screen.getByLabelText('Password')).toHaveValue('');
            expect(screen.getByLabelText('Role')).toHaveValue('');
        });
    });

    it('renders department input for non-customer roles', async () => {
        renderComponent();

        await userEvent.click(screen.getByLabelText('Role'));
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('does not render department input for customer role', async () => {
        renderComponent();

        await userEvent.click(screen.getByLabelText('Role'));
        await userEvent.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
