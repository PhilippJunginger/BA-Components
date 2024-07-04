import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt
- without assertion

- unused import
- doppelung keine variable - 3
- unnecessary mock
- TypeError

- 3 von 6 notwendigem Testumfang erreicht + 3 Redudndanz


Best-Practices: -20
CleanCode: -30
Testumfang: 41,75
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword123!',
    },
];

const mockSetUsers = jest.fn();

jest.mock('../../services/api', () => ({
    createUser: jest.fn(),
}));

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without errors', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
    });

    it('updates new user state on input change', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByRole('combobox', {
            name: 'Role',
        }) as HTMLSelectElement;

        await userEvent.type(nameInput, 'Test Name');
        await userEvent.type(emailInput, 'test@email.com');
        await userEvent.type(passwordInput, 'TestPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput.value).toBe('Test Name');
        expect(emailInput.value).toBe('test@email.com');
        expect(passwordInput.value).toBe('TestPassword123!');
        expect(roleSelect.value).toBe(USER_ROLE.ADMIN);
    });

    it('displays password error messages', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByRole('button', {
            name: 'Add User',
        });

        await userEvent.type(passwordInput, 'short');
        await userEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('displays error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const submitButton = screen.getByRole('button', {
            name: 'Add User',
        });

        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits form successfully and resets form', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByRole('combobox', {
            name: 'Role',
        }) as HTMLSelectElement;
        const submitButton = screen.getByRole('button', {
            name: 'Add User',
        });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@email.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(roleSelect.value).toBe('');
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'new@email.com',
                password: 'NewPassword123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });
});
