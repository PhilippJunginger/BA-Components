import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PasswordError } from '../../models/passwordError';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: Verwendung von fireEvent
- very critical: keine Verwendung von UserEvent

- clean code: keine variablen erstellt - 4 mal
- unused import - 2 mal
- initalProps spreading

- 5 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -20
Testumfang: 57,2
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const setUsersMock = jest.fn();
    const mockRouterPush = jest.fn();
    const initialProps = {
        setUsers: setUsersMock,
        users: [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ] as User[],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            query: {
                shouldRoute: 'false',
            },
            push: mockRouterPush,
        });
    });

    it('renders correctly', () => {
        render(<AddUserFormSchwer {...initialProps} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', () => {
        render(<AddUserFormSchwer {...initialProps} />);
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        expect(screen.getByLabelText('Name')).toHaveValue('Jane');
        expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('displays error when email is already taken', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('handles password validation errors', () => {
        render(<AddUserFormSchwer {...initialProps} />);
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('submits the form successfully and resets state', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer {...initialProps} />);

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledWith([
                ...initialProps.users,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
            ]);
        });

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('handles server error on form submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer {...initialProps} />);

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('navigates to user page on successful submission if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({
            query: {
                shouldRoute: 'true',
            },
            push: mockRouterPush,
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer {...initialProps} />);

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });
});
