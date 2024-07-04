import { render, screen, fireEvent } from '@testing-library/react';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';

/*
- assertion missing - 3 mal

- userEvent.setup doppelung
- unused import
- TypeError - 2

- 2 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -30
CleanCode: -20
Testumfang: 25,05
 */

// Mock fetch to control API responses
global.fetch = jest.fn();

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = []; // Start with empty user list

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('renders without errors', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('handles form input changes', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox', { name: 'Role' });
        const departmentInput = screen.getByLabelText('Department'); // This may not always exist

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Str0ngP@ssw0rd!');
        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);

        if (departmentInput) {
            await user.type(departmentInput, 'Engineering');
        }
    });

    it('validates password requirements', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        // Test with invalid password
        await user.type(passwordInput, 'weak');
        await user.click(submitButton);

        const errorMessages = screen.getAllByRole('listitem');
        expect(errorMessages.length).toBeGreaterThan(0); // Check for error messages

        // Test with valid password
        await user.clear(passwordInput);
        await user.type(passwordInput, 'Str0ngP@ssw0rd!');
        await user.click(submitButton);
    });

    it('prevents duplicate emails', async () => {
        fetch.mockResolvedValue({
            json: () => Promise.resolve(),
            ok: true,
        }); // Mock successful fetch

        const user = userEvent.setup();
        mockUsers.push({ name: 'Existing User', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER }); // Add existing user
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByText('Add User');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com'); // Duplicate email
        await user.click(submitButton);

        const errorAlert = screen.getByText('Es ist ein Fehler aufgetreten!');
        expect(errorAlert).toBeInTheDocument();
    });

    // ... (More tests for successful user creation, API error handling, etc.)
});
