import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- render in beforeEach


- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -10
CleanCode: 0
Testumfang: 33,4
 */

describe('AddUserFormMittel Component', () => {
    const user = userEvent.setup();
    const setUsersMock = jest.fn();
    const users = [{ name: 'Test User', email: 'test@test.com', role: USER_ROLE.CUSTOMER, password: 'Test1234!' }];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);
        setUsersMock.mockClear();
    });

    it('should render all input fields', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should show error message if email is already taken', async () => {
        await user.type(screen.getByLabelText('Name'), 'Test User');
        await user.type(screen.getByLabelText('Email'), 'test@test.com');
        await user.type(screen.getByLabelText('Password'), 'Test1234!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add a new user with valid data', async () => {
        const newUser = {
            name: 'New User',
            email: 'newuser@test.com',
            password: 'Password123!',
            role: USER_ROLE.ADMIN,
            department: 'IT',
        };

        await user.type(screen.getByLabelText('Name'), newUser.name);
        await user.type(screen.getByLabelText('Email'), newUser.email);
        await user.type(screen.getByLabelText('Password'), newUser.password);
        await user.selectOptions(screen.getByLabelText('Role'), newUser.role);
        await user.type(screen.getByLabelText('Department'), newUser.department);

        // Mock the fetch call to return a successful response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ success: true }),
                status: 201,
            }),
        ) as jest.Mock;

        await user.click(screen.getByText('Add User'));

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({ ...newUser, department: 'IT' }),
        });

        expect(setUsersMock).toHaveBeenCalledWith([...users, { ...newUser, department: 'IT' }]);
    });

    it('should show password validation errors', async () => {
        const passwordInput = screen.getByLabelText('Password');
        const invalidPassword = 'abc';

        await user.type(passwordInput, invalidPassword);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should clear the form after adding a user', async () => {
        await user.type(screen.getByLabelText('Name'), 'New User');
        await user.type(screen.getByLabelText('Email'), 'newuser@test.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        // Mock the fetch call to return a successful response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ success: true }),
                status: 201,
            }),
        ) as jest.Mock;

        await user.click(screen.getByText('Add User'));

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });
});
