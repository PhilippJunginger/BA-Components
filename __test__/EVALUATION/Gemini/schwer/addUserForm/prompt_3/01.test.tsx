import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent fehlt
- fireEvent


- doppelung variable - 3
- typerror - 3

- 5 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -30
CleanCode: -30
Testumfang: 66,8
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: User[] = [
    {
        userId: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockImplementation(() => {
            return {
                push: jest.fn(),
                query: { shouldRoute: 'false' },
            };
        });
    });

    it('renders the form with correct initial values', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Create new User');
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'P@$$w0rd' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });

        expect(nameInput.value).toBe('Test User');
        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('P@$$w0rd');
        expect(roleSelect.value).toBe(USER_ROLE.EMPLOYEE);
    });

    it('displays password validation errors', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('displays an error message if email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={mockUsers} />);
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(emailInput, { target: { value: mockUsers[0].email } });
        fireEvent.click(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form with valid data', async () => {
        const mockFetch = jest.fn(
            () =>
                new Promise((resolve) =>
                    resolve({
                        json: () => Promise.resolve({ userId: '2' }),
                        status: 200,
                    }),
                ),
        );
        global.fetch = mockFetch;

        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={[]} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'P@$$w0rd' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        await new Promise((r) => setTimeout(r, 100));

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'P@$$w0rd',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'P@$$w0rd',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('redirects after successful user creation if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockImplementation(() => {
            return {
                push: jest.fn(),
                query: { shouldRoute: 'true' },
            };
        });

        const mockFetch = jest.fn(
            () =>
                new Promise((resolve) =>
                    resolve({
                        json: () => Promise.resolve({ userId: '2' }),
                        status: 200,
                    }),
                ),
        );
        global.fetch = mockFetch;

        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={[]} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'P@$$w0rd' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        await new Promise((r) => setTimeout(r, 100));

        const router = useRouter();
        expect(router.push).toHaveBeenCalledWith('http://localhost:3000/users?id=2');
    });

    it('shows department field for non-customer roles', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });

        expect(screen.getByLabelText('Department')).toBeVisible();
    });
});
