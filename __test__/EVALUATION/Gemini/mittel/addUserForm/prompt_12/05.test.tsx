import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup missing

- doppelung keine Variable - 2
- typeError - 2

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -10
CleanCode: -20
Testumfang: 33,4
 */

const mockUsers = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

const mockSetUsers = jest.fn();

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all input fields', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('should update input fields on change', async () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password error messages', async () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should display error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'test1@example.com');

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add new user on submit', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ id: '2' }),
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'Newuser1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'Newuser1!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'Newuser1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });
});
