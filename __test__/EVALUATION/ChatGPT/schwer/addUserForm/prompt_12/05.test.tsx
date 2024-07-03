import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*

- unused import
- clean code: keine variablen erstellt - 4 mal
- unnötige waitFor - 2 mal

- 4 von 7 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: 0
CleanCode: -35
Testumfang: 42,9
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
    ];

    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ query: {} });
    });

    it('should render the form correctly', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should update input values correctly', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('should show password error messages', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');

        await user.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should show error if email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, 'john@example.com');
        await user.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('should call setUsers and reset form on successful submission', async () => {
        (global as any).fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        );

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
            ]);
        });

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('should navigate to user page on successful submission if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({ query: { shouldRoute: 'true' }, push: jest.fn() });
        (global as any).fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        );

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        await waitFor(() => {
            expect(useRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });
});
