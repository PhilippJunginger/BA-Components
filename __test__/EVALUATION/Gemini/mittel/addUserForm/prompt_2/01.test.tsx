import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*

- userEvent.setuo doppelung
- Doppelung variablen - 2

- 1 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: 0
CleanCode: -15
Testumfang: 0
 */

// Mock fetch to control API responses
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = []; // Start with an empty users array

    beforeEach(() => {
        jest.clearAllMocks(); // Clear any previous mocks before each test
    });

    it('renders without errors', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
        // Assert that the main components are rendered (heading, form fields, button)
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        // Type values into inputs
        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        // Assert that input values have changed
        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('shows error alert for duplicate email', async () => {
        const user = userEvent.setup();
        mockUsers.push({ name: 'Existing User', email: 'existing.user@example.com', role: USER_ROLE.CUSTOMER });
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'existing.user@example.com'); // Duplicate email
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    // ... (Add more tests for password validation, successful user creation, error handling, etc.)
});
