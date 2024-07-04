import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent

- render Funktion
- userEvent.setuo doppelung
- Doppelung variablen - 3
- TypeError

- 3 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -10
CleanCode: -25
Testumfang: 33,4
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

const mockSetUsers = jest.fn();
const mockUsers = [] as User[];
const initialUser = { name: '', email: '', role: '' as USER_ROLE, password: '' };

const renderComponent = (users: User[] = mockUsers) =>
    render(<AddUserFormMittel setUsers={mockSetUsers} users={users} />);

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with initial state', () => {
        renderComponent();

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('updates form fields correctly', async () => {
        const user = userEvent.setup();

        renderComponent();

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'johndoe@example.com');
        await user.type(passwordInput, 'Password123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput.value).toBe('John Doe');
        expect(emailInput.value).toBe('johndoe@example.com');
        expect(passwordInput.value).toBe('Password123!');
        expect(roleSelect.value).toBe(USER_ROLE.ADMIN);
    });

    it('shows error for duplicate email', async () => {
        const existingUser = { ...initialUser, email: 'existing@example.com' };
        renderComponent([existingUser]);

        const user = userEvent.setup();
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        await user.type(emailInput, 'existing@example.com');

        const submitButton = screen.getByText('Add User');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('shows password errors', async () => {
        const user = userEvent.setup();

        renderComponent();
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        await user.type(passwordInput, 'invalid'); // Invalid password

        const submitButton = screen.getByText('Add User');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            // Other password error messages can be checked as well
        });
    });

    it('adds a new user successfully', async () => {
        const user = userEvent.setup();

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...initialUser, name: 'John Doe', email: 'johndoe@example.com' }),
        });

        renderComponent();

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'johndoe@example.com');
        await user.type(passwordInput, 'Password123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        const submitButton = screen.getByText('Add User');
        await user.click(submitButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
        });
        expect(mockSetUsers).toHaveBeenCalledTimes(1);
    });

    // Add more tests for error scenarios (e.g., failed API call), department input, etc.
});
