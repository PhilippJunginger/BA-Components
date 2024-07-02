import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical error: Verwendung von fireEvent

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

    it.skip('should render the form with initial state', () => {
        render(<AddUserFormLeicht {...initialProps} />);

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });

    it.skip('should update state on input change', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it.skip('should show error if email already exists', async () => {
        const user = userEvent.setup();
        const existingUser = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht {...initialProps} users={[existingUser]} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'jane.doe@example.com');

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should show password error if password is invalid', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'invalid');

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('should add user if all inputs are valid', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
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
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it.skip('should not show department field if role is CUSTOMER', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
