import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent missing
- fireEvent
- render in beforeEach

- doppelung screen
- typerror

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -40
CleanCode: -10
Testumfang: 50,1
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Password1!',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    role: USER_ROLE.EMPLOYEE,
    password: 'Password123!',
    department: 'IT',
};

const mockSetUsers = jest.fn();

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        query: { shouldRoute: 'false' },
    }),
}));

global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);
    });

    it('renders the component with correct initial state', () => {
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('handles input changes correctly', () => {
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: mockNewUser.name } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: mockNewUser.email } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: mockNewUser.password } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: mockNewUser.role } });

        expect(screen.getByLabelText('Name')).toHaveValue(mockNewUser.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockNewUser.email);
        expect(screen.getByLabelText('Password')).toHaveValue(mockNewUser.password);
        expect(screen.getByLabelText('Role')).toHaveValue(mockNewUser.role);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
        expect(screen.getByLabelText('Department')).toHaveValue('');
    });

    it('validates password and displays error messages', () => {
        const invalidPasswords = ['1234567', 'password', 'Password1', 'Passwordpassword!'];
        const errorMessages = [
            'Password needs to be 8 characters long',
            'Needs to contain at least one digit',
            'Needs to contain at least one uppercase and one lowercase letter',
            'Needs to contain at least one special character',
        ];

        invalidPasswords.forEach((password, index) => {
            fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
            expect(screen.getByText(errorMessages[index])).toBeVisible();
        });
    });

    it('handles form submission successfully', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
            status: 201,
        });

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: mockNewUser.name } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: mockNewUser.email } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: mockNewUser.password } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: mockNewUser.role } });
        fireEvent.change(screen.getByLabelText('Department'), {
            target: { value: mockNewUser.department },
        });

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await expect(fetch).toHaveBeenCalledTimes(1);
        await expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({ ...mockNewUser, id: undefined }),
        });

        await screen.findByText('Es ist ein Fehler aufgetreten!');
        expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, id: undefined }]);
    });

    it('handles duplicate email error', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
            status: 201,
        });

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: mockNewUser.name } });
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: mockUsers[0].email },
        });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: mockNewUser.password } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: mockNewUser.role } });
        fireEvent.change(screen.getByLabelText('Department'), {
            target: { value: mockNewUser.department },
        });

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await expect(fetch).not.toHaveBeenCalled();
        expect(mockSetUsers).not.toHaveBeenCalled();
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('handles API errors gracefully', async () => {
        (fetch as jest.Mock).mockRejectedValue(new Error('API request failed'));

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: mockNewUser.name } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: mockNewUser.email } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: mockNewUser.password } });
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: mockNewUser.role } });
        fireEvent.change(screen.getByLabelText('Department'), {
            target: { value: mockNewUser.department },
        });

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await expect(fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).not.toHaveBeenCalled();
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
