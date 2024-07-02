import { render, screen } from '@testing-library/react';
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

    it('should render the form with initial values', () => {
        render(<AddUserFormLeicht {...initialProps} />);

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('should update state on input change', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');

        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');

        await user.type(screen.getByLabelText('Password'), 'Password123!');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error if email already exists', async () => {
        const user = userEvent.setup();
        const existingUser = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht {...initialProps} users={[existingUser]} />);

        await user.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should show password error if password is invalid', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        await user.type(screen.getByLabelText('Password'), 'invalid');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should add user if form is valid', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.click(screen.getByRole('button', { name: 'Add User' }));

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
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not show department field if role is CUSTOMER', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht {...initialProps} />);

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
