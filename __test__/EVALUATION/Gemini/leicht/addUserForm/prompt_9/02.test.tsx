import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- render in beforeEach
- userEvent,setup fehtl


- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanzen


Best-Practices: -20
CleanCode: 0
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const setUsersMock = jest.fn();
    const users: User[] = []; // Start with an empty array

    beforeEach(() => {
        render(<AddUserFormLeicht users={users} setUsers={setUsersMock} />);
    });

    it('renders the form fields correctly', () => {
        // Check for presence of all input fields and labels
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('adds a new user with valid data', async () => {
        const user: User = {
            name: 'John Doe',
            email: 'johndoe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'SecurePassword123!',
        };

        // Fill in form fields
        await userEvent.type(screen.getByLabelText('Name'), user.name);
        await userEvent.type(screen.getByLabelText('Email'), user.email);
        await userEvent.selectOptions(screen.getByLabelText('Role'), user.role);
        await userEvent.type(screen.getByLabelText('Password'), user.password);

        // Submit the form
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        // Check if setUsers was called with the new user data
        expect(setUsersMock).toHaveBeenCalledWith([user]);

        // Check if form fields were reset
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
    });

    it('shows error for duplicate email', async () => {
        const existingUser: User = {
            name: 'Jane Smith',
            email: 'janesmith@example.com',
            role: USER_ROLE.ADMIN,
            password: 'AnotherSecurePassword123!',
        };

        //add user to existing users
        users.push(existingUser);

        // Fill in form fields with same email
        await userEvent.type(screen.getByLabelText('Name'), existingUser.name);
        await userEvent.type(screen.getByLabelText('Email'), existingUser.email);
        await userEvent.selectOptions(screen.getByLabelText('Role'), existingUser.role);
        await userEvent.type(screen.getByLabelText('Password'), existingUser.password);

        // Submit the form
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        // Check if error message is displayed
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    //Add Test for weak passwords
    it('shows error for weak password', async () => {
        const user: User = {
            name: 'John Doe',
            email: 'johndoe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'weakpassword', //too short and no special characters
        };

        // Fill in form fields
        await userEvent.type(screen.getByLabelText('Name'), user.name);
        await userEvent.type(screen.getByLabelText('Email'), user.email);
        await userEvent.selectOptions(screen.getByLabelText('Role'), user.role);
        await userEvent.type(screen.getByLabelText('Password'), user.password);

        // Submit the form
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        // Check if error message is displayed
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    // ... Add more tests for different scenarios, e.g.,
    // invalid form data, interactions with the department field for non-customers, etc.
});
