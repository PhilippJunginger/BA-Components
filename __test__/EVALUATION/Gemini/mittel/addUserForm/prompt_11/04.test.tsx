import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- assetions waitFor
- userEvent.setuo missing

- TypeError - 4

- 5 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 66,8
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
    password: 'Password1!',
    role: USER_ROLE.ADMIN,
    department: 'Test Department',
};

const setUsersMock = jest.fn();

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all fields', () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should render department field for admin and employee roles', async () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should handle form submission with valid data', async () => {
        const createUserMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: async () => ({ ...mockNewUser, id: '2' }),
            status: 200,
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(createUserMock).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify(mockNewUser),
            });
            expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, id: '2' }]);
        });
    });

    it('should show error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.click(screen.getByText('Add User'));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should show error message if password is not valid', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Password'), 'short');
        await userEvent.click(screen.getByText('Add User'));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should clear form fields after successful submission', async () => {
        const createUserMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: async () => ({ ...mockNewUser, id: '2' }),
            status: 200,
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(screen.getByLabelText('Email')).toHaveValue('');
            expect(screen.getByLabelText('Password')).toHaveValue('');
            expect(screen.getByLabelText('Role')).toHaveValue('');
            expect(screen.getByLabelText('Department')).toHaveValue('');
        });
    });

    it('should display error message if user creation fails', async () => {
        const testErrorMessage = 'User creation failed';
        const createUserMock = jest.spyOn(global, 'fetch').mockRejectedValueOnce({
            message: testErrorMessage,
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(createUserMock).toHaveBeenCalled();
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });
});
