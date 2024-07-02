import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent

- clean code: did not instantiate userEvent.setup() at top-level
- komplizierte Verwendung von initialProps

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 2 Redundanzen

Best-Practices: -10
CleanCode: -10
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render the form with initial state', () => {
        render(<AddUserFormLeicht {...initialProps} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it.skip('should update state on input change', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it.skip('should show error if email already exists', async () => {
        const existingUser = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht {...initialProps} users={[existingUser]} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'jane.doe@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should show password error if password is invalid', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'pass');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('should add user if all inputs are valid', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'John Doe');

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john.doe@example.com');

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'Password123!');

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);
    });

    it.skip('should show department field if role is ADMIN or EMPLOYEE', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it.skip('should not show department field if role is CUSTOMER', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
