import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*

- TypeError
- userEvent.setuo doppelung
- Doppelung variablen - 2

- 3 von 6 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: 0
CleanCode: -25
Testumfang: 41,75
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    const setUsersMock = jest.fn();
    const users: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with initial values', () => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('validates password input', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('handles email input and displays error if email is taken', async () => {
        const user = userEvent.setup();
        const existingUser = {
            name: 'John',
            email: 'john@example.com',
            role: USER_ROLE.ADMIN,
            password: 'password123',
        };
        render(<AddUserFormMittel setUsers={setUsersMock} users={[existingUser]} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'john@example.com'); // Use existing user's email

        const submitButton = screen.getByText('Add User');
        await user.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        expect(setUsersMock).not.toHaveBeenCalled();
    });

    it('submits the form with valid data and updates the user list', async () => {
        const user = userEvent.setup();
        fetch.mockResolvedValue({
            json: () => Promise.resolve({ message: 'User created successfully' }),
        });

        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'Jane Doe');
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane@example.com');
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'Password123!');
        const roleSelect = screen.getByLabelText('Role');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByText('Add User');
        await user.click(submitButton);

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', expect.objectContaining({ method: 'POST' }));
        expect(setUsersMock).toHaveBeenCalledWith([
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    // Add more test cases for other scenarios and edge cases (e.g., form reset, department input for non-customer roles, error handling during fetch)
});
