import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- very critical: userEvent not used

- clean code: keine variablen erstellt - 2 mal
- TypeError


- 3 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -15
Testumfang: 35,75
*/

describe('AddUserFormSchwer', () => {
    const mockSetUsers = jest.fn();
    const mockRouterPush = jest.fn();

    jest.mock('next/router', () => ({
        useRouter: () => ({
            push: mockRouterPush,
            query: { shouldRoute: 'true' },
        }),
    }));

    beforeEach(() => {
        mockSetUsers.mockClear();
        mockRouterPush.mockClear();
    });

    it('renders form inputs', () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByText(/add user/i)).toBeInTheDocument();
    });

    it('validates password correctly', () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        fireEvent.blur(passwordInput);

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it('prevents adding user with existing email', async () => {
        const existingUsers = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ];
        render(<AddUserFormSchwer users={existingUsers} setUsers={mockSetUsers} />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.ADMIN } });
        fireEvent.click(screen.getByText(/add user/i));

        expect(await screen.findByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
    });

    it('adds new user and redirects when form is submitted', async () => {
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({ userId: '123' }),
        });

        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.ADMIN } });
        fireEvent.click(screen.getByText(/add user/i));

        await waitFor(() => expect(mockSetUsers).toHaveBeenCalledWith(expect.any(Array)));
        expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');

        fetchMock.mockRestore();
    });
});
