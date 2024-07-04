import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- userEvent.setup
- fireEvent
- promises not handled
- assertions waitFor

- TypeError
- Doppelung variablen

- 3 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -40
CleanCode: -10
Testumfang: 33,4
 */

// Mock fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ message: 'User created successfully' }),
    }),
) as jest.Mock;

const mockSetUsers = jest.fn();
const mockUsers = []; // Initial users array

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with initial values', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department'); // This should not be present initially

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        // Check if the department input field appears
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.type(departmentInput, 'Sales');
    });

    it('displays password error messages', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        // ...(add other error message assertions)
    });

    it('adds a new user successfully', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // ...(fill in all input fields with valid data)
        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(mockSetUsers).toHaveBeenCalledTimes(1);
            expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, { name: 'John Doe' /* ...other user data */ }]);
        });
    });

    it('displays error message for duplicate email', async () => {
        mockUsers.push({ email: 'john.doe@example.com' } as User); // Simulate existing user
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // ...(fill in email with 'john.doe@example.com' and other valid data)
        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    // ...(add more test cases for error handling, invalid form submission, etc.)
});
