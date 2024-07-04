import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent

- doppelung keine Variable - 2
- TypeError
- userEvent.setup doppelung

- 3 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -10
CleanCode: -20
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword123!',
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
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should update input fields correctly', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@test.com');
        await user.type(passwordInput, 'TestPassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@test.com');
        expect(passwordInput).toHaveValue('TestPassword123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password validation errors', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should display error message if email is already taken', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'test@test.com');
        await user.type(passwordInput, 'TestPassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await user.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add a new user when form is submitted with valid data', async () => {
        const user = userEvent.setup();
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ id: '2' }),
            status: 201,
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'newuser@test.com');
        await user.type(passwordInput, 'NewPassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await user.click(submitButton);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                id: '2',
                name: 'New User',
                email: 'newuser@test.com',
                password: 'NewPassword123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });
});
