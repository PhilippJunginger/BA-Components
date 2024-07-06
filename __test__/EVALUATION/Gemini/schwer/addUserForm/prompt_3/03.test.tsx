import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- fireEvent


- doppelung variable - 3
- typerror

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 33,4
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Password1!',
    },
];

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
            query: {},
        });
    });

    it('renders the form with correct initial values', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Create new User');
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.EMPLOYEE);
    });

    it('displays password error messages correctly', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);
        const passwordInput = screen.getByLabelText('Password');
        fireEvent.change(passwordInput, { target: { value: 'Test1' } });
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('displays error message when email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={mockUsers} />);
        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: mockUsers[0].email } });
        const submitButton = screen.getByText('Add User');
        fireEvent.click(submitButton);
        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form with correct values and updates user list', async () => {
        const mockSetUsers = jest.fn();
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            query: { shouldRoute: 'true' },
        });

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'NewPassword1!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.submit(submitButton);

        // Mock the fetch call to return a successful response
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: async () => ({ userId: '2' }),
        });

        await expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'NewPassword1!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'NewPassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');

        expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/users?id=2');
    });
});
