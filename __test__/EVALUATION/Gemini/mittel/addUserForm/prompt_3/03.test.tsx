import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- fireEvent
- promise not handled
- userEvent.setup fehlt

- TypeError
- unnecessary mock

- 3 von 6 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redudndanz


Best-Practices: -30
CleanCode: -10
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword123!',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@test.com',
    role: USER_ROLE.EMPLOYEE,
    password: 'NewPassword123!',
    department: 'Test Department',
};

const mockSetUsers = jest.fn();

jest.mock('../../services/api', () => ({
    createUser: jest.fn(() => Promise.resolve({ data: mockNewUser })),
}));

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with correct initial values', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Create new User');
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('select-label')).toHaveValue('');
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('select-label'), [USER_ROLE.EMPLOYEE]);

        expect(screen.getByLabelText('Name')).toHaveValue(mockNewUser.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockNewUser.email);
        expect(screen.getByLabelText('Password')).toHaveValue(mockNewUser.password);
        expect(screen.getByLabelText('select-label')).toHaveValue(USER_ROLE.EMPLOYEE);
    });

    it('validates password correctly', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        // Test invalid passwords
        await userEvent.type(passwordInput, 'password');
        fireEvent.submit(screen.getByRole('form'));
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Password123');
        fireEvent.submit(screen.getByRole('form'));
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        // Test valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, mockNewUser.password);
        fireEvent.submit(screen.getByRole('form'));
        expect(screen.queryByText('Password needs to be 8 characters long')).toBeNull();
    });

    it('displays an error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('select-label'), [USER_ROLE.CUSTOMER]);

        fireEvent.submit(screen.getByRole('form'));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form successfully and resets the form', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('select-label'), [USER_ROLE.EMPLOYEE]);

        fireEvent.submit(screen.getByRole('form'));

        expect(await screen.queryByText('Es ist ein Fehler aufgetreten!')).toBeNull();
        expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, mockNewUser]);
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('select-label')).toHaveValue('');
    });

    it('displays department field for non-customer roles', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.selectOptions(screen.getByLabelText('select-label'), [USER_ROLE.EMPLOYEE]);

        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('does not display department field for customer role', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.selectOptions(screen.getByLabelText('select-label'), [USER_ROLE.CUSTOMER]);

        expect(screen.queryByLabelText('Department')).toBeNull();
    });
});
