import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: Verwendung von fireEvent
- very critical: userEvent not used
- critical: too many assertions waitFor

- unused import
- clean code: keine variablen erstellt - 3 mal
- TypeError

- 4 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -25
Testumfang: 42,9
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const setUsersMock = jest.fn();
    const mockUsers = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        useRouter.mockReturnValue({ query: {}, push: jest.fn() });
    });

    it('renders the component', () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    it.skip('handles input changes correctly', () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it.skip('displays password validation errors', () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.blur(passwordInput);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it.skip('displays error if email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it.skip('submits the form successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ userId: '123' }),
                status: 200,
            }),
        );

        const routerPushMock = jest.fn();
        useRouter.mockReturnValue({ query: { shouldRoute: 'true' }, push: routerPushMock });

        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                },
            ]);
            expect(routerPushMock).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    it('handles server error during user creation', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ message: 'Error' }),
                status: 500,
            }),
        );

        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });
});
