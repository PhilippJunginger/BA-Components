import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- assertions waitFor
- userEvent.setup missing

- doppelung keine Variable - 3
- unnecessary waitFor
- typeError

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -25
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
    },
];

// Mock the fetch function to simulate API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const setUsersMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form correctly', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should update the form fields correctly', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(screen.getByDisplayValue(USER_ROLE.ADMIN)).toBeInTheDocument();
    });

    it('should display password validation errors', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test1');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should display an error message if the email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'test@test.com');
        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should submit the form and add the new user', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(setUsersMock).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                    password: 'Test1234!',
                    role: USER_ROLE.EMPLOYEE,
                },
            ]);
        });
    });
});
