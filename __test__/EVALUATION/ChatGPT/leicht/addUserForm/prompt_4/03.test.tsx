import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- minor: Unused import
- clean code: did not instantiate userEvent.setup() at top-level
- komplizierte Verwendung von initialProps

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 2 Redundanzen

Best-Practices: 0
CleanCode: -15
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
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'John Doe');
        expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');

        await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('john.doe@example.com');

        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('Password123!');

        await user.click(screen.getByLabelText(/Role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(screen.getByLabelText(/Role/i)).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error if email already exists', async () => {
        const existingUser = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht {...initialProps} users={[existingUser]} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Email/i), 'jane.doe@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should show password error if password does not meet criteria', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Password/i), 'pass');
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should add user if all fields are valid', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'John Doe');
        await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.click(screen.getByLabelText(/Role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);
    });

    it('should show department field if role is ADMIN or EMPLOYEE', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        await user.click(screen.getByLabelText(/Role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should not show department field if role is CUSTOMER', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const user = userEvent.setup();

        await user.click(screen.getByLabelText(/Role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
