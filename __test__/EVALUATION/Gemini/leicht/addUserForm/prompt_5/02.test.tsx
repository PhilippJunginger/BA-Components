import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: userEvent.setup not used
- critical: promises not handled
- critical: render in beforeEach

- unused import
- doppelung variablen nicht benutzt - 1 mal

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -10
Testumfang: 62,5

 */

// Mock function for setUsers
const mockSetUsers = jest.fn();

describe('AddUserFormLeicht Component', () => {
    // Setup before each test
    beforeEach(() => {
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);
    });

    it('renders the form fields correctly', () => {
        // Check if all required fields are present
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('displays department field when role is not customer', async () => {
        // Select a role that is not 'CUSTOMER'
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('handles form submission correctly', async () => {
        // Fill out valid form data
        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        // Submit the form
        await userEvent.click(screen.getByText('Add User'));

        // Check if setUsers was called with the correct data
        expect(mockSetUsers).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('displays errors for invalid email or password', async () => {
        // Invalid email test
        await userEvent.type(screen.getByLabelText('Email'), 'invalid');
        await userEvent.click(screen.getByText('Add User'));
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();

        // Invalid password test (short password)
        await userEvent.type(screen.getByLabelText('Password'), 'short');
        await userEvent.click(screen.getByText('Add User'));
        const passwordErrorList = within(screen.getByRole('alert')).getAllByRole('listitem');
        expect(passwordErrorList).toHaveLength(4); // 4 password rules
    });

    // Additional tests...
    // (More tests can be added to cover edge cases, input validation, and other component behaviors)
});
