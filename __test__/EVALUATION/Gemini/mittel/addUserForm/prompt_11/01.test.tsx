import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- assertions waitFor
- userEvent.setuo missing

- doppelung keine variable
- TypeError - 3

- 4 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 58,45
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'Testpassword1!',
    role: USER_ROLE.ADMIN,
    department: 'Test Department',
};

const setUsersMock = jest.fn();

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all input fields', () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should display error message when email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockUsers[0].role);
        await userEvent.type(screen.getByLabelText('Password'), 'Testpassword1!');

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should call createUser and setUsers when form is submitted with valid data', async () => {
        const createUserMock = jest.spyOn(window, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ id: '2' }),
        } as Response);

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(createUserMock).toHaveBeenCalledTimes(1);
            expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, id: '2' }]);
        });
    });

    it('should display error messages for invalid password', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test1');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should clear form after successful user creation', async () => {
        jest.spyOn(window, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ id: '2' }),
        } as Response);

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(screen.getByLabelText('Email')).toHaveValue('');
            expect(screen.getByLabelText('Password')).toHaveValue('');
            expect(screen.getByLabelText('Role')).toHaveValue('');
            expect(screen.getByLabelText('Department')).toHaveValue('');
        });
    });
});
