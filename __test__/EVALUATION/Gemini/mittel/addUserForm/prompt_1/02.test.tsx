import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup
- fireEvent
- promises not handled

- TypeError - 3 mal
- Doppelung variablen - 3 mal

- 4 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -30
CleanCode: -30
Testumfang: 50,1
 */

// Mock fetch API to simulate response
global.fetch = jest.fn(async () =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [];

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        // Check if all fields and the button are rendered
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        // Simulate user input
        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'johndoe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        // Assert the state has been updated
        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('John Doe');
        expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('johndoe@example.com');
        expect((screen.getByLabelText('Password') as HTMLInputElement).value).toBe('Password123!');
        expect((screen.getByLabelText('Role') as HTMLSelectElement).value).toBe(USER_ROLE.ADMIN);
    });

    it('validates password correctly', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        // Input a weak password and check for error messages
        await userEvent.type(screen.getByLabelText('Password'), 'weak');
        fireEvent.blur(screen.getByLabelText('Password'));

        // Assert that the password error message is displayed
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        // Additional assertions for other password requirements can be added
    });

    it('shows error alert when email is already taken', async () => {
        render(
            <AddUserFormMittel setUsers={mockSetUsers} users={[{ ...initialUser, email: 'johndoe@example.com' }]} />,
        );
        await userEvent.type(screen.getByLabelText('Email'), 'johndoe@example.com');
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('adds a new user successfully', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        // Fill the form with valid data
        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'johndoe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);

        await userEvent.click(screen.getByText('Add User'));

        // Assert that the API call was made
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...initialUsers,
                {
                    ...initialUser,
                    name: 'John Doe',
                    email: 'johndoe@example.com',
                    password: 'Password123!',
                    role: USER_ROLE.EMPLOYEE,
                },
            ]);
        });
    });

    it('shows error alert when adding a new user fails', async () => {
        fetch.mockImplementationOnce(async () =>
            Promise.resolve({
                json: () => Promise.resolve({}),
                status: 500,
            }),
        );
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        // Fill the form with valid data
        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'johndoe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);

        await userEvent.click(screen.getByText('Add User'));

        // Assert that the error alert is displayed
        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });
});
