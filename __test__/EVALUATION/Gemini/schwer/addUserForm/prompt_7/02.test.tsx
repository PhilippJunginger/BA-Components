import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- fireEvent
- userEvent setup

- variable
- type error - 2

- 6 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -20
CleanCode: -15
Testumfang: 41,75
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

const mockSetUsers = jest.fn();

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        query: { shouldRoute: 'false' },
    }),
}));

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the form with correct inputs', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('validates password correctly', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');

        // Type invalid passwords and check for error messages
        await userEvent.type(passwordInput, 'test');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Testtest1');
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Testtest!');
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
    });

    test('displays error message for duplicate email', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test1@example.com');
        await userEvent.type(passwordInput, 'TestPassword123!');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    test('submits the form with valid data', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ userId: '2' }),
        });

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'TestPassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test User 2',
                email: 'test2@example.com',
                password: 'TestPassword123!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Test User 2',
                email: 'test2@example.com',
                password: 'TestPassword123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });
});
