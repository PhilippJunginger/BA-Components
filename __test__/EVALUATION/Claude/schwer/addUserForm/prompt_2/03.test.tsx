import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*

- waitFor - 3
- doppelung keine Variable - 3
- typeerror
- setup


- 6 von 7 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: 0
CleanCode: -40
Testumfang: 71,5
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];
    const mockRouter = {
        push: jest.fn(),
        query: {},
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('shows password error messages for invalid password', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'weak');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('selects a role correctly', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(roleSelect).toHaveTextContent(USER_ROLE.ADMIN);
    });

    it('shows department field when role is not CUSTOMER', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('submits the form successfully', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalled();
        });
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', expect.any(Object));
    });

    it('shows error when email is already taken', async () => {
        const user = userEvent.setup();
        const existingUser = { email: 'john@example.com' };
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[existingUser]} />);

        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('routes to user page when shouldRoute is true', async () => {
        mockRouter.query = { shouldRoute: 'true' };
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    it('shows error alert when API call fails', async () => {
        global.fetch = jest.fn(() => Promise.reject('API Error')) as jest.Mock;
        const user = userEvent.setup();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });
});
