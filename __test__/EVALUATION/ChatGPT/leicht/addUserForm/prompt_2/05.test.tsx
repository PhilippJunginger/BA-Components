import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical error: Verwendung von fireEvent
- minor error: setting up userEvent.setup() inside tests instead of once in describe
- komplizierte spreaden von initialProps

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundanzen

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -15
CleanCode: -5
Testumfang: 62.5
 */

describe('AddUserFormLeicht Component', () => {
    const initialProps = {
        setUsers: jest.fn(),
        users: [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE, password: 'Passw0rd!' }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form fields correctly', () => {
        render(<AddUserFormLeicht {...initialProps} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('allows the user to fill in the form', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('Password1!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('shows error if password does not meet criteria', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(passwordInput, 'weakpass');
        fireEvent.click(submitButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('shows error if email already exists', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'john@example.com');
        fireEvent.click(submitButton);

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    it('calls setUsers with the new user on valid form submission', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        fireEvent.click(submitButton);

        expect(initialProps.setUsers).toHaveBeenCalledWith([
            ...initialProps.users,
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password1!',
            },
        ]);
    });

    it('resets form after successful submission', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        fireEvent.click(submitButton);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('shows department field when role is ADMIN or EMPLOYEE', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
