import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*


- tyoerror

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: 0
CleanCode: -5
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    role: USER_ROLE.ADMIN,
    password: 'password123!',
};

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        query: { shouldRoute: 'false' },
    }),
}));

// Mock the fetch function to avoid actual API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: '2' }),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();

    it('renders the form correctly', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);

        await user.type(screen.getByLabelText('Name'), mockNewUser.name);
        await user.type(screen.getByLabelText('Email'), mockNewUser.email);
        await user.type(screen.getByLabelText('Password'), mockNewUser.password);

        const selectElement = screen.getByLabelText('Role') as HTMLSelectElement;
        await user.selectOptions(selectElement, String(mockNewUser.role));

        expect(screen.getByLabelText('Name')).toHaveValue(mockNewUser.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockNewUser.email);
        expect(screen.getByLabelText('Password')).toHaveValue(mockNewUser.password);
        expect(selectElement).toHaveValue(String(mockNewUser.role));
    });

    it('validates password correctly', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        await user.clear(passwordInput);
        await user.type(passwordInput, 'password123!');

        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeVisible();
    });

    it('displays an error message for duplicate email', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);

        await user.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form successfully', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer users={mockUsers} setUsers={setUsersMock} />);

        await user.type(screen.getByLabelText('Name'), mockNewUser.name);
        await user.type(screen.getByLabelText('Email'), mockNewUser.email);
        await user.type(screen.getByLabelText('Password'), mockNewUser.password);

        const selectElement = screen.getByLabelText('Role') as HTMLSelectElement;
        await user.selectOptions(selectElement, String(mockNewUser.role));

        await user.click(screen.getByText('Add User'));

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify(mockNewUser),
        });

        expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, id: expect.any(String) }]);
    });
});
