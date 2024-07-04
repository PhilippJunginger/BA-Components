import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { User, USER_ROLE } from '../../../../../../models/user';

/*

- userEvent.setup Doppelung
- doppelung variablen nicht benutzt - 3 mal
- TypeError

- 3 von 4 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: 0
CleanCode: -25
Testumfang: 37,5

 */

describe('AddUserFormLeicht', () => {
    it('renders the form fields correctly', () => {
        render(<AddUserFormLeicht setUsers={() => {}} users={[]} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument(); // Should be hidden initially
    });

    it('initializes the new user state correctly', () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormLeicht setUsers={setUsersMock} users={[]} />);

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.USER);
    });

    it('handles user input correctly', async () => {
        render(<AddUserFormLeicht setUsers={() => {}} users={[]} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument(); // Department field should be visible for Admin role
    });

    it('shows email error if email is already taken', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.USER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht setUsers={() => {}} users={[existingUser]} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Email'), 'existing@example.com'); // Use the existing email
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('shows password error if password is invalid', async () => {
        render(<AddUserFormLeicht setUsers={() => {}} users={[]} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Password'), 'weakpassword'); // Use a weak password
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('submits the form successfully and calls setUsers', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormLeicht setUsers={setUsersMock} users={[]} />);
        const user = userEvent.setup();

        // ... (fill in the form with valid data)
        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        await user.type(screen.getByLabelText('Department'), 'Development');

        await user.click(screen.getByText('Add User'));

        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: USER_ROLE.EMPLOYEE,
                password: 'Password123!',
                department: 'Development',
            },
        ]);
    });
});
