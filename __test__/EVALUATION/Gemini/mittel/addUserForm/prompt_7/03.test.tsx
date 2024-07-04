import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt
- fireEvent

- doppelung keine Variable - 3
- doppelung screen... - 2
- TypeError - 4

- 5 von 6 notwendigem Testumfang erreicht + 1 Ausnahme + 3 Redudndanz


Best-Practices: -20
CleanCode: -45
Testumfang: 58,45
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testpassword1!',
    },
];

const mockSetUsers = jest.fn();

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form with all fields', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should display error message when email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'test@test.com');

        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should call createUser function with correct user data when all fields are valid', async () => {
        const createUser = jest.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => ({ success: true }),
            status: 200,
        });

        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'New User');

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'newuser@test.com');

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Testpassword1!');

        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);

        expect(createUser).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@test.com',
                password: 'Testpassword1!',
                role: USER_ROLE.ADMIN,
            }),
        });
    });

    it('should display error message when createUser function fails', async () => {
        const createUser = jest.spyOn(window, 'fetch').mockRejectedValueOnce({ message: 'Failed to create user' });

        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'New User');

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'newuser@test.com');

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Testpassword1!');

        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);

        expect(createUser).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should update the users list after successfully creating a new user', async () => {
        jest.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => ({ success: true }),
            status: 200,
        });

        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'New User');

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'newuser@test.com');

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Testpassword1!');

        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'newuser@test.com',
                password: 'Testpassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should display department field for admin and employee roles', async () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not display department field for customer role', async () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should display password validation errors', async () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'test');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should clear the form after adding a user', async () => {
        jest.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => ({ success: true }),
            status: 200,
        });

        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'New User');

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'newuser@test.com');

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Testpassword1!');

        const roleSelect = screen.getByLabelText('Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });
});
