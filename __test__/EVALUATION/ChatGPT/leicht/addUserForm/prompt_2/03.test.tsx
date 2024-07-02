import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical error: Verwendung von fireEvent
- critical error: did not instantiate userEvent.setup()
- unnötige Render Funktion
- komplizierte spreaden von Props

- 4 von 4 notwendigem Testumfang erreicht + 5 Redundanzen

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -20
CleanCode: -5
Testumfang: 50
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const initialProps = {
        setUsers: mockSetUsers,
        users: [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' }],
    };

    const setup = () => {
        render(<AddUserFormLeicht {...initialProps} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with initial values', () => {
        setup();
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('handles name input change', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('handles email input change', async () => {
        setup();
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('handles password input change', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Password1!');
        expect(passwordInput).toHaveValue('Password1!');
    });

    it('handles role selection change', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.click(roleSelect);
        await userEvent.selectOptions(
            screen.getByRole('listbox'),
            screen.getByRole('option', { name: USER_ROLE.ADMIN }),
        );
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.ADMIN);
    });

    it('shows department field when role is not customer', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.click(roleSelect);
        await userEvent.selectOptions(
            screen.getByRole('listbox'),
            screen.getByRole('option', { name: USER_ROLE.ADMIN }),
        );
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('displays error when email is already taken', async () => {
        setup();
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'john@example.com');
        fireEvent.submit(screen.getByRole('form'));
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('displays password error when password is invalid', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'password');
        fireEvent.submit(screen.getByRole('form'));
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('submits form successfully with valid data', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'Password1!');
        await userEvent.click(roleSelect);
        await userEvent.selectOptions(
            screen.getByRole('listbox'),
            screen.getByRole('option', { name: USER_ROLE.ADMIN }),
        );

        fireEvent.submit(screen.getByRole('form'));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialProps.users,
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password1!',
                department: '',
            },
        ]);
    });
});
