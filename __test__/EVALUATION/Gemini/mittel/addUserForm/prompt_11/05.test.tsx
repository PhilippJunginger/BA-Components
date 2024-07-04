import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- assetions waitFor
- userEvent.setup missing

- doppelung keine Variable
- doppelung screen
- unnötige waitFor - 3
- typeError

- 5 von 6 notwendigem Testumfang erreicht + 1 Ausnahme +  Redundazen


Best-Practices: -20
CleanCode: -30
Testumfang: 75,15
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@test.com',
    password: 'Testpassword1!',
    role: USER_ROLE.ADMIN,
};

const setUsersMock = jest.fn();

global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setUsersMock.mockClear();
    });

    test('renders form elements correctly', () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('displays department field for ADMIN and EMPLOYEE roles', async () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    test('does not display department field for CUSTOMER role', async () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    test('validates password correctly', async () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);
        const passwordInput = screen.getByLabelText('Password');

        // Invalid passwords
        await userEvent.type(passwordInput, 'Test1');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'testtest');
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Testtest1');
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        // Valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Testpassword1!');
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeVisible();
        expect(
            screen.queryByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).not.toBeVisible();
        expect(screen.queryByText('Needs to contain at least one special character')).not.toBeVisible();
    });

    test('handles form submission correctly', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve({ ...mockNewUser, id: '2' }),
            status: 201,
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), 'Test Department');

        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify(mockNewUser),
            });
            expect(setUsersMock).toHaveBeenCalledWith([
                ...mockUsers,
                { ...mockNewUser, id: '2', department: 'Test Department' },
            ]);
        });
    });

    test('handles email already taken error', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.reject(new Error('Email already taken')),
            status: 400,
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), 'Test Department');

        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });

    test('handles other errors during user creation', async () => {
        (fetch as jest.Mock).mockRejectedValue(new Error('Failed to create user'));

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), 'Test Department');

        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });
});
