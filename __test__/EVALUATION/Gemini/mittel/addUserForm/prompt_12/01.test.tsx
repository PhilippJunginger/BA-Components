import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup missing
- fireEvent

- doppelung keine Variable - 4
- missing import
- typeError - 2

- 4 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -20
CleanCode: -35
Testumfang: 58,45
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
    },
];

const mockSetUsers = jest.fn();

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form correctly', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should update the user state on input change', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password error messages', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test1');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should display an error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'test@test.com');
        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add a new user on submit', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: async () => ({ id: '2' }),
            status: 201,
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                password: 'Test1234!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                password: 'Test1234!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('should display an error message if adding a user fails', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to create user'));

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalled();
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should close the error alert', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        // Simulate an error state
        fireEvent.click(screen.getByText('Add User'));

        const errorAlert = screen.getByText('Es ist ein Fehler aufgetreten!');
        expect(errorAlert).toBeVisible();

        const closeButton = within(errorAlert).getByRole('button');
        fireEvent.click(closeButton);

        expect(errorAlert).not.toBeVisible();
    });
});
