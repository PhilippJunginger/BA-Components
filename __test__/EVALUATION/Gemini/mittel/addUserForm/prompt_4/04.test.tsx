import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../AddUserFormMittel';
import { USER_ROLE, User } from '../../models/user';

/*
- userEvent.setup fehlt
- fireEvent

- doppelung keine variable - 4

- 4 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -20
Testumfang: 50,1
 */

const mockUsers: User[] = [
    { name: 'Test User', email: 'test@test.com', role: USER_ROLE.CUSTOMER, password: 'Testpassword1!' },
];

const mockSetUsers = jest.fn();

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all input fields and the button', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('select-label')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('updates the user state on input change', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(nameInput, { target: { value: 'Test Name' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test123!' } });

        expect((nameInput as HTMLInputElement).value).toBe('Test Name');
        expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
        expect((passwordInput as HTMLInputElement).value).toBe('Test123!');
    });

    it('validates the password correctly', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        fireEvent.change(passwordInput, { target: { value: 'Test1' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        fireEvent.change(passwordInput, { target: { value: 'Testtest1!' } });
        fireEvent.click(submitButton);

        expect(screen.queryByText('Password needs to be 8 characters long')).toBeNull();
    });

    it('displays an error message if the email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, 'test@test.com');
        fireEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('calls the createUser function and updates the user list on submit', async () => {
        const mockCreateUser = jest.fn().mockResolvedValue({});
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({}),
            status: 200,
        });

        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('select-label');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'Testpassword1!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        await expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'Testpassword1!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'Testpassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('displays an error message if createUser fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Failed to create user'));

        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('select-label');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'Testpassword1!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
