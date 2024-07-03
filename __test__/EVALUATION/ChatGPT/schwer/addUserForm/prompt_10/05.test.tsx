import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: fireEvent verwendet

- clean code: keine variablen erstellt - 2 mal
- unnötige waitFor - 3 mal

- 4 von 7 notwendigen Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -25
Testumfang: 42,9
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer', () => {
    const user = userEvent.setup();
    const mockRouter = {
        push: jest.fn(),
        query: {},
    };
    const mockSetUsers = jest.fn();
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it.skip('renders the form with initial values', () => {
        render(<AddUserFormSchwer {...initialProps} />);
        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });

    it('shows error message when password requirements are not met', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('adds a new user on successful form submission', async () => {
        const mockUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password1!',
        };

        render(<AddUserFormSchwer {...initialProps} />);

        await user.type(screen.getByLabelText(/Name/i), mockUser.name);
        await user.type(screen.getByLabelText(/Email/i), mockUser.email);
        await user.type(screen.getByLabelText(/Password/i), mockUser.password);
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ]);
        });
    });

    it.skip('shows error when email is already taken', async () => {
        const existingUser = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password1!',
        };

        render(<AddUserFormSchwer {...initialProps} users={[existingUser]} />);

        await user.type(screen.getByLabelText(/Name/i), 'New User');
        await user.type(screen.getByLabelText(/Email/i), existingUser.email);
        await user.type(screen.getByLabelText(/Password/i), 'Password1!');
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it.skip('closes error message on close button click', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        // Simulate error state
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

        const closeButton = screen.getByLabelText(/close-icon/i);
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText(/Es ist ein Fehler aufgetreten!/i)).not.toBeInTheDocument();
        });
    });

    it.skip('navigates to user details page on successful submission if shouldRoute is true', async () => {
        mockRouter.query = { shouldRoute: 'true' };
        const mockUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password1!',
        };

        render(<AddUserFormSchwer {...initialProps} />);

        await user.type(screen.getByLabelText(/Name/i), mockUser.name);
        await user.type(screen.getByLabelText(/Email/i), mockUser.email);
        await user.type(screen.getByLabelText(/Password/i), mockUser.password);
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/users?id=');
        });
    });
});
