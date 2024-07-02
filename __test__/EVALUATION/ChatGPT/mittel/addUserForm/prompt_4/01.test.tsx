import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: Verwendung von render in beforeEach


- unused import
- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal
- clean code: Doppelung von userEvent.setup()
- unnötiges await waitFor


- 5 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: -10
CleanCode: -25
Testumfang: 66,8
*/

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it.skip('should render the form with initial values', () => {
        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });

    it.skip('should update state on input change', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        expect(screen.getByLabelText(/name/i)).toHaveValue('Jane Doe');

        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        expect(screen.getByLabelText(/email/i)).toHaveValue('jane@example.com');

        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        expect(screen.getByLabelText(/password/i)).toHaveValue('Password123!');

        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(screen.getByLabelText(/role/i)).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/password/i), 'short');
        expect(screen.getByLabelText(/password/i)).toHaveValue('short');
        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('should show error if email is already taken', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it('should add a new user successfully', async () => {
        const user = userEvent.setup();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
            ]);
        });
    });

    it('should handle API error gracefully', async () => {
        const user = userEvent.setup();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        ) as jest.Mock;

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it('should close error alert when close icon is clicked', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();

        await user.click(screen.getByLabelText(/close-icon/i));
        expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
    });
});
