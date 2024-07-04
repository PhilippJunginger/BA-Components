import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- userEvent.setup
- fireEvent
- promises not handled

- TypeError - 3 mal

- 4 von 6 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -30
CleanCode: -15
Testumfang: 58,45
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

const mockSetUsers = jest.fn();
const mockUsers = []; // Initial users array

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // Check if all form elements are rendered
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('validates password input', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // Enter an invalid password
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'invalid');

        // Check if error messages are displayed
        expect(await screen.findByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            await screen.findByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(await screen.findByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(await screen.findByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('handles user input and adds a new user', async () => {
        const mockNewUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'StrongPassword123!',
        };

        // Mock successful API response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockNewUser,
        });

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // Fill in the form
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        fireEvent.change(roleSelect, { target: { value: mockNewUser.role } });
        await userEvent.click(submitButton);

        // Wait for the form submission and user addition
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(mockSetUsers).toHaveBeenCalledWith([mockNewUser]);
    });

    it('handles email already taken error', async () => {
        const mockNewUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'StrongPassword123!',
        };

        // Mock API response with email already taken error
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 409,
            json: async () => ({ message: 'Email already taken' }),
        });

        render(<AddUserFormMittel setUsers={mockSetUsers} users={[{ ...mockNewUser }]} />);

        // Fill in the form
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        fireEvent.change(roleSelect, { target: { value: mockNewUser.role } });
        await userEvent.click(submitButton);

        // Wait for the error message
        await screen.findByText('Es ist ein Fehler aufgetreten!');
    });

    it('shows department field for ADMIN and EMPLOYEE roles', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.queryByLabelText('Department');

        // Check that department input is not visible initially
        expect(departmentInput).not.toBeInTheDocument();

        // Change role to ADMIN
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        // Check that department input is visible
        expect(await screen.findByLabelText('Department')).toBeInTheDocument();

        // Change role to EMPLOYEE
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });

        // Check that department input is still visible
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        // Change role to CUSTOMER
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        // Check that department input is not visible again
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
