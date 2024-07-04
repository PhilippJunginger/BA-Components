import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt
- fireEvent

- TypeError - 2
- setup Funktion

- 3 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -15
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Password1!',
    },
];

const mockNewUser: User = {
    id: '2',
    name: 'Test User 2',
    email: 'test2@test.com',
    role: USER_ROLE.ADMIN,
    password: 'Password2!',
    department: 'Test Department',
};

const setUsersMock = jest.fn();

const setup = () => {
    render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);
};

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        setup();
        setUsersMock.mockClear();
    });

    it('should render all fields', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should successfully add a new user with valid details', async () => {
        const fetchMock = jest
            .spyOn(global, 'fetch')
            .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve(mockNewUser) });

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.ADMIN]);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, mockNewUser]);
    });

    it('should show an error message if email is already taken', async () => {
        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.ADMIN]);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should display password validation errors', async () => {
        const passwordInput = screen.getByLabelText('Password');
        const invalidPassword = 'abc';

        await userEvent.type(passwordInput, invalidPassword);
        await fireEvent.blur(passwordInput);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should clear the form after adding a user', async () => {
        const fetchMock = jest
            .spyOn(global, 'fetch')
            .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve(mockNewUser) });

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.ADMIN]);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, mockNewUser]);

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.getByLabelText('Department')).toHaveValue('');
    });
});
