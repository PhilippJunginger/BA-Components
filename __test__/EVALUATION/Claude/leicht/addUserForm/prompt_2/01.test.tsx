import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*

- doppelung userevnet.setup
- unused import
- doppelung keine Variable - 3
- doppelung screen...
- typeerror

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 3 Redundazen


Best-Practices: 0
CleanCode: -35
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    const renderComponent = () => render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        renderComponent();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('updates the form fields when user types', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
    });

    it('shows department field for admin and employee roles', async () => {
        renderComponent();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText('Role');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('does not show department field for customer role', async () => {
        renderComponent();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText('Role');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('shows error when email already exists', async () => {
        const existingUser = { email: 'existing@example.com' };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPass1!');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error when password is invalid', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Password'), 'invalid');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPass1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'ValidPass1!' },
        ]);
    });

    it('resets form after successful submission', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPass1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });
});
