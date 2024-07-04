import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*


- userEvent.setup doppelung
- doppelung keine variable
- TypeError - 2

- 2 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: 0
CleanCode: -20
Testumfang: 25,05
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = []; // Start with an empty user list

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        // Assert presence of form elements
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('validates password requirements and displays errors', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        const user = userEvent.setup();

        // Test with an invalid password (too short)
        await user.type(passwordInput, '12345');
        await user.click(screen.getByText('Add User')); // Submit form

        // Check for error message
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('handles successful user creation', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...initialUser, id: 1 }), // Mocked response data
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const user = userEvent.setup();

        // Fill in valid form data
        await user.type(screen.getByLabelText('Name'), 'Test User');
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPassword123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        // Submit the form
        await user.click(screen.getByText('Add User'));

        // Wait for the form to clear and the users to be updated
        await waitFor(() => {
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(mockSetUsers).toHaveBeenCalledWith([
                expect.objectContaining({
                    name: 'Test User',
                    email: 'test@example.com',
                    id: 1, // Assert the mock response data is added to the user list
                }),
            ]);
        });
    });

    // ... (Add more test cases as needed)
});
