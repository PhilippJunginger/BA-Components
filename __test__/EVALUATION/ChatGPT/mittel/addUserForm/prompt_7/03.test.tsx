import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: Verwendung von fireEvent
- critical: render in beforeEach
- very critical: userEvent nicht benutzt
- critical: too many assertions waitFor

- unused import
- clean code: Doppelung - keine variablen erstellt - 2 mal


- 5 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 1 Redundanz


Best-Practices: -40
CleanCode: -30
Testumfang: 75,15
*/

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders the form correctly', () => {
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('shows error message when email is already taken', async () => {
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('shows password error messages when password does not meet criteria', async () => {
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            expect(
                screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
            ).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
        });
    });

    it('submits the form successfully with valid data', async () => {
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
            ]);
        });
    });

    it('shows department field when role is ADMIN or EMPLOYEE', () => {
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.EMPLOYEE } });
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('hides department field when role is CUSTOMER', () => {
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('closes error alert when close icon is clicked', async () => {
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByLabelText('close-icon'));

        await waitFor(() => {
            expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
        });
    });
});
