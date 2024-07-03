import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: Verwendung von fireEvent

- doppelung userEvent.setup
- render Funkton erstellt
- clean code: keine variablen erstellt - 3 mal
- TypeError


- 4 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 42,9
*/

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.USER, password: 'Passw0rd!' },
    ];

    const setup = () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);
    };

    it('renders the form correctly', () => {
        setup();
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('allows user to input name, email, and password', async () => {
        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
    });

    it('shows validation errors for invalid password', async () => {
        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Password'), 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('displays error when email is already taken', async () => {
        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('adds new user and clears form on successful submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        );

        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        fireEvent.mouseDown(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ]);

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('displays and clears error message', async () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: /Add User/i }));
        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('close-icon'));
        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
