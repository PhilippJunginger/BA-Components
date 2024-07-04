import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt

- doppelung keine Variable - 2
- TypeError

- 4 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -10
CleanCode: -15
Testumfang: 50,1
 */

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'Test User', email: 'test@test.com', role: USER_ROLE.CUSTOMER, password: 'password123' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all input fields', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should update the user state on input change', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@test.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User 2');
        expect(emailInput).toHaveValue('test2@test.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages for invalid passwords', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should show an error message if the email is already taken', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'test@test.com');

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add a new user on submit', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: () => Promise.resolve({}),
            status: 201,
        });

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@test.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@test.com',
                password: 'Password123!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@test.com',
                password: 'Password123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('should show an error message if adding a user fails', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValueOnce({});

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@test.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalled();
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
