import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent

- keine Verwendung von Variablen, um Eingaben zu überprüfen - 4-mal
- komplizierte Verwendung von initialProps

- 4 von 4 notwendigem Testumfang erreicht + 5 Redundanzen

Best-Practices: -10
CleanCode: -5
Testumfang: 37,5
 */

describe('AddUserFormLeicht Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render the form with all fields', () => {
        render(<AddUserFormLeicht {...initialProps} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should show entered value in the name field', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should show entered value in the email field', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'jane.doe@example.com');
        expect(emailInput).toHaveValue('jane.doe@example.com');
    });

    it('should show entered value in the password field', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it.skip('should change value of select field', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department field when role is not customer', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should show error message for invalid password', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'pass');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it.skip('should show error message for duplicate email', async () => {
        const propsWithExistingUser = {
            ...initialProps,
            users: [
                { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
            ],
        };
        render(<AddUserFormLeicht {...propsWithExistingUser} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john.doe@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    it('should call setUsers with new user data on valid form submission', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Email/i), 'jane.doe@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.click(screen.getByLabelText(/Role/i));
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password123!',
            },
        ]);
    });
});
