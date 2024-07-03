import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- critical: userEvent.setup() fehlt
- critical: too many assertions waitFor

- clean code: keine variablen erstellt - 5 mal
- unused import - 2 mal
- TypeError
- render Funktion erstellt

- 5 von 7 notwendigen Testumfang erreicht + 1 Ausnahme + 4 Redundanz


Best-Practices: -30
CleanCode: -20
Testumfang: 42,9
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const mockRouterPush = jest.fn();
    const mockSetUsers = jest.fn();

    beforeEach(() => {
        useRouter.mockImplementation(() => ({
            query: {},
            push: mockRouterPush,
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (users = []) => render(<AddUserFormSchwer setUsers={mockSetUsers} users={users} />);

    it.skip('renders the component', () => {
        renderComponent();
        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
    });

    it('updates name input value', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/name/i);
        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
    });

    it('updates email input value', async () => {
        renderComponent();
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it.skip('updates password input value and shows validation error messages', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'weakpass');
        expect(passwordInput).toHaveValue('weakpass');
        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('selects a role from the dropdown', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.click(roleSelect);
        const option = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await userEvent.click(option);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it.skip('shows department input when role is not CUSTOMER', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.click(roleSelect);
        const option = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await userEvent.click(option);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it.skip('does not show department input when role is CUSTOMER', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.click(roleSelect);
        const option = screen.getByRole('option', { name: USER_ROLE.CUSTOMER });
        await userEvent.click(option);
        expect(roleSelect).toHaveValue(USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it('displays error message if email is already taken', async () => {
        const existingUser = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        renderComponent([existingUser]);
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'jane.doe@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        await screen.findByRole('alert');
    });

    it.skip('submits the form and adds new user', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        );

        renderComponent();
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalled();
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    it.skip('handles API errors gracefully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ error: 'Invalid data' }),
            }),
        );

        renderComponent();
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });
});
