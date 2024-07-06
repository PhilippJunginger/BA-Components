import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup

- screen - 2
- typerror - 2
- unused import

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -10
CleanCode: -25
Testumfang: 50,1
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

const mockSetUsers = jest.fn();

jest.mock('next/router', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            query: {
                shouldRoute: 'false',
            },
        };
    },
}));

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders form fields with correct labels', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    test('submits form with valid user data', async () => {
        const user: User = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'SecurePassword123!',
            role: USER_ROLE.ADMIN,
        };

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);
        const fetchSpy = jest.spyOn(global, 'fetch');
        fetchSpy.mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ userId: '2' }),
        });

        await userEvent.type(screen.getByLabelText('Name'), user.name);
        await userEvent.type(screen.getByLabelText('Email'), user.email);
        await userEvent.type(screen.getByLabelText('Password'), user.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), user.role);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify(user),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, { ...user, id: '2' }]);
    });

    test('displays an error message when adding a user with an existing email', async () => {
        const user: User = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'SecurePassword123!',
            role: USER_ROLE.ADMIN,
        };

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), user.name);
        await userEvent.type(screen.getByLabelText('Email'), user.email);
        await userEvent.type(screen.getByLabelText('Password'), user.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), user.role);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    test('validates password correctly', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        // Test each password rule individually
        const invalidPasswords = [
            '1234567', // Too short
            'abcdefg1', // Missing uppercase
            'ABCDEFGH1', // Missing lowercase
            'abcdefghA', // Missing digit
            'Abcdefgh1', // Missing special character
        ];
        for (const password of invalidPasswords) {
            await userEvent.clear(passwordInput);
            await userEvent.type(passwordInput, password);
            await userEvent.click(submitButton);
            expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        }

        // Test a valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'SecurePassword123!');
        await userEvent.click(submitButton);
        // Assuming no other errors, the form should be submitted and the password error messages should not be visible
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeVisible();
    });

    test('clears form after successful user creation', async () => {
        const user: User = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'SecurePassword123!',
            role: USER_ROLE.ADMIN,
        };

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);
        const fetchSpy = jest.spyOn(global, 'fetch');
        fetchSpy.mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ userId: '2' }),
        });

        await userEvent.type(screen.getByLabelText('Name'), user.name);
        await userEvent.type(screen.getByLabelText('Email'), user.email);
        await userEvent.type(screen.getByLabelText('Password'), user.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), user.role);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    test('conditionally renders Department field for non-customer roles', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        // Initially, the Department field should not be visible
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();

        // Select a non-customer role (e.g., ADMIN)
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        // The Department field should now be visible
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
