import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical eslint error: userEvent Promise not handled
- critical: no usage of userEvent.setup()
- critical: Verwendung von fireEvent

- clean code: unnecessary render function
- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal

- 5 von 6 notwendigem Testumfang erreicht + 5 Redundanz


Best-Practices: -30
CleanCode: -15
Testumfang: 41,75
 */

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
    }),
) as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    const renderComponent = () => render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component', () => {
        renderComponent();
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    test.skip('handles input changes', () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    test.skip('validates password input', () => {
        renderComponent();

        const passwordInput = screen.getByLabelText('Password');
        fireEvent.change(passwordInput, { target: { value: 'weak' } });

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test.skip('handles role selection', async () => {
        renderComponent();

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test.skip('displays department field for non-customer roles', async () => {
        renderComponent();

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    test.skip('handles form submission successfully', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByText('Add User');
        fireEvent.click(submitButton);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password123!',
            },
        ]);
    });

    test.skip('handles email already taken error', async () => {
        const mockUsersWithExistingEmail = [
            {
                name: 'Existing User',
                email: 'john.doe@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password123!',
            },
        ];
        render(<AddUserFormMittel users={mockUsersWithExistingEmail} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });

        const submitButton = screen.getByText('Add User');
        fireEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('handles API error', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                status: 500,
                json: () => Promise.resolve({ message: 'Internal Server Error' }),
            }),
        );

        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByText('Add User');
        fireEvent.click(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });
});
