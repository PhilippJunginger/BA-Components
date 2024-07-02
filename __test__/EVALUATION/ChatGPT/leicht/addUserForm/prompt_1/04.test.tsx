import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../models/user';
import AddUserFormLeicht from '../../../../../components/leicht/addUserFormLeicht';

/*
- critical eslint error: rendering inside beforeEach violating AAA
- critical eslint error: userEvent Promise not handled
- critical best-practice: userEvent.setup not used
- critical best-practice: Verwendung von fireEvent
- verwendung von unnötiger render funktion

- 4 von 4 notwendigen Testfälen erreicht + 2 Redundanzen

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -40
CleanCode: -15
Testumfang: 75
 */

// Mock data
const mockUsers: User[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password123!', department: 'IT' },
];

// Mock props
const mockSetUsers = jest.fn();

const renderComponent = () => {
    render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
};

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        renderComponent();
    });

    it('renders the form fields', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('updates state on input change', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');

        await userEvent.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');

        await userEvent.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('shows password error for invalid password', async () => {
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'invalid');
        fireEvent.click(submitButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it('shows email error if email already exists', async () => {
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        fireEvent.click(submitButton);

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    it('calls setUsers with new user on successful submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        fireEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
                department: '',
            },
        ]);
    });

    it('renders department field if role is not customer', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
