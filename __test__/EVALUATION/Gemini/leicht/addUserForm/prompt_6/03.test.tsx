import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render in beforeEach

- Doppelung userEvent.setup
- TypeError
- doppelung variablen nicht benutzt - 2 mal

- 1 von 4 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -20
Testumfang: 0

 */

// Mock data
const mockUsers = [];
const mockSetUsers = jest.fn();

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
    });

    // Developer 1's test
    it('should render form fields with correct labels', () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(roleSelect).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
    });

    // Developer 2's test
    it('should update state when input fields change', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'johndoe@example.com');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('johndoe@example.com');
    });

    // Developer 3's test (combined with improved test name)
    it('should show validation errors for invalid password and existing email', async () => {
        const user = userEvent.setup();
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        // Simulate existing email
        mockUsers.push({ name: '', email: 'johndoe@example.com', role: USER_ROLE.CUSTOMER, password: '' });

        await user.type(emailInput, 'johndoe@example.com');
        await user.type(passwordInput, 'weak');
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        // ...(Other password validation errors)
    });
});
