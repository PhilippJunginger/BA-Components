import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render in beforeEach

- userEvent,setup doppelung
- doppelung - keine Varuable - 2 mal
- TypeError


- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanzen


Best-Practices: -10
CleanCode: -15
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const users = [];

    beforeEach(() => {
        render(<AddUserFormLeicht users={users} setUsers={mockSetUsers} />);
    });

    it('renders the form fields correctly', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument(); // Initially hidden
    });

    it('validates password requirements', async () => {
        const user = userEvent.setup();
        await user.type(screen.getByLabelText('Password'), 'short');
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('handles email validation', async () => {
        const user = userEvent.setup();
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.click(screen.getByText('Add User')); // Submit with invalid password to avoid adding the user

        // Assuming this email is already in the users array
        render(<AddUserFormLeicht users={[{ ...users[0], email: 'test@example.com' }]} setUsers={mockSetUsers} />);
        await user.click(screen.getByText('Add User'));
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('adds a new user successfully', async () => {
        const user = userEvent.setup();
        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPassword123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
        await user.type(screen.getByLabelText('Department'), 'Sales');

        await user.click(screen.getByText('Add User'));
        expect(mockSetUsers).toHaveBeenCalledWith([
            expect.objectContaining({
                name: 'John Doe',
                email: 'john@example.com',
                role: USER_ROLE.ADMIN,
                department: 'Sales',
            }),
        ]);
    });

    // Add more tests to cover different scenarios:
    // - Adding a user with role CUSTOMER (should not show department field)
    // - Error cases like missing required fields
    // - Resetting the form after adding a user
});
