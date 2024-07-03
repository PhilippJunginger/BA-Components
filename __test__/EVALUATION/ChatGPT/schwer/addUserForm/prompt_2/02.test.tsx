import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- critical: userEvent.setup fehlt

- clean code: keine variablen erstellt - 5 mal

- 5 von 7 notwendigen Testumfang erreicht + 4 Redundanz


Best-Practices: -20
CleanCode: -25
Testumfang: 42,9
*/

// Mock the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush, query: {} });

const mockSetUsers = jest.fn();

describe('AddUserFormSchwer Component', () => {
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    beforeEach(() => {
        mockSetUsers.mockClear();
        mockPush.mockClear();
    });

    it('should render the component', () => {
        render(<AddUserFormSchwer {...initialProps} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    it.skip('should handle name input change', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
    });

    it.skip('should handle email input change', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it.skip('should handle password input change and show validation errors', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');
        expect(passwordInput).toHaveValue('short');
        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        });
    });

    it.skip('should handle role selection', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.click(roleSelect);
        const option = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await userEvent.click(option);
        expect(screen.getByText(USER_ROLE.ADMIN)).toBeInTheDocument();
    });

    it.skip('should show department field when role is not CUSTOMER', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.click(roleSelect);
        const option = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await userEvent.click(option);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it.skip('should display error message when email is already taken', async () => {
        const users = [
            { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ];
        render(<AddUserFormSchwer {...initialProps} users={users} />);
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'existing@example.com');
        const submitButton = screen.getByRole('button', { name: /Add User/i });
        fireEvent.submit(submitButton);
        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it.skip('should submit the form successfully and reset state', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({ userId: '123' }),
        });

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.click(roleSelect);
        const option = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await userEvent.click(option);

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        fireEvent.submit(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...initialProps.users,
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                },
            ]);
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
        });
    });

    it.skip('should redirect to users page after successful submission when shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush, query: { shouldRoute: 'true' } });

        render(<AddUserFormSchwer {...initialProps} />);
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({ userId: '123' }),
        });

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.click(roleSelect);
        const option = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await userEvent.click(option);

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        fireEvent.submit(submitButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });
});
