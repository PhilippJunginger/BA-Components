import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordError } from '../../models/passwordError';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
. critical: promises not handled
- critical: userEvent.setup() not used

- unused import
- initialProps spreading
- clean code: keine variablen erstellt - 2 mal

- 4 von 7 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: -30
CleanCode: -20
Testumfang: 50,05
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer', () => {
    const mockSetUsers = jest.fn();
    const mockRouterPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: {},
            push: mockRouterPush,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    const renderComponent = (props = initialProps) => render(<AddUserFormSchwer {...props} />);

    it('renders the form correctly', () => {
        renderComponent();

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('handles form input changes correctly', () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password1!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.ADMIN);
    });

    it('validates password correctly', () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Pass' } });

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('shows error message if email is already taken', async () => {
        const props = {
            ...initialProps,
            users: [{ email: 'john.doe@example.com' } as User],
        };

        renderComponent(props);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('calls setUsers and redirects on successful user creation', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({ userId: '1' }),
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await screen.findByRole('button', { name: 'Add User' });

        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ]);
        expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=1');
    });

    it('shows error message on failed user creation', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 400,
            json: jest.fn().mockResolvedValue({ message: 'Error' }),
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('resets the error message when close icon is clicked', async () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText('close-icon'));

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
