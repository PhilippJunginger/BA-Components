import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*


- userEvent.setup doppelung
- doppelung keine variable
- TypeError

- 3 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: 0
CleanCode: -15
Testumfang: 41,75
 */

// Mock the fetch function to simulate API requests
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const users = [
        { name: 'Existing User', email: 'existing@user.com', role: USER_ROLE.CUSTOMER, password: 'password123!' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({}),
            status: 200,
        });
    });

    it('renders form fields correctly', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={[]} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('validates password requirements', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={[]} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short'); // Invalid password

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('prevents duplicate emails', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={users} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'existing@user.com');
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument(); // Error alert should be visible
    });

    it('adds a new user successfully', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={users} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'new@user.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(screen.getByText('Add User'));

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...users,
            { name: 'New User', email: 'new@user.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    // ... additional tests for department field, error handling, etc.
});
