import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- very critical: userEvent nicht verwendet
- critical: fireEvent verwendet
- cirtical: promises not handled
- critical: assertions waitFor

- unused import
- clean code: keine variablen erstellt - 2 mal
- render FUnktion erstellt

- 5 von 7 notwendigen Testumfang erreicht + 1 Ausnahme + 1 Redundanz


Best-Practices: -50
CleanCode: -20
Testumfang: 64,35
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = useRouter as jest.Mock;

const setUsersMock = jest.fn();

const users: User[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
];

const setup = () => {
    return render(<AddUserFormSchwer setUsers={setUsersMock} users={users} />);
};

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRouter.mockReturnValue({
            query: {},
            push: jest.fn(),
        });
    });

    it('should render the form fields correctly', () => {
        setup();

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('should display error when email is already taken', async () => {
        setup();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('should display password validation errors', async () => {
        setup();

        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
            expect(
                screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
            ).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
        });
    });

    it('should call setUsers and reset form on successful submission', async () => {
        mockRouter.mockReturnValueOnce({
            query: {},
            push: jest.fn(),
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        setup();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledWith([
                ...users,
                { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ]);
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(screen.getByLabelText('Email')).toHaveValue('');
            expect(screen.getByLabelText('Password')).toHaveValue('');
            expect(screen.getByLabelText('Role')).toHaveValue('');
        });
    });

    it('should route to user page if shouldRoute is true', async () => {
        mockRouter.mockReturnValueOnce({
            query: { shouldRoute: 'true' },
            push: jest.fn(),
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        setup();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(mockRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    it('should hide department field when role is CUSTOMER', () => {
        setup();

        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should show department field when role is not CUSTOMER', () => {
        setup();

        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
