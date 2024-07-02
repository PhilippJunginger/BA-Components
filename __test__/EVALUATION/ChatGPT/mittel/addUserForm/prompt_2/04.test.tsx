import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: keine Verwendung von userEvent.setup()
- critical: Verwendung von fireEvent

- unused constant
- unused type
- clean code: doppelung von userEvent.setup()
- clean code: Doppelung - keine variablen erstellt in zweitem test - 3 mal
- TypeError calling mockClear on gloabal.fetch

- 5 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -35
Testumfang: 66,8
*/

const mockSetUsers = jest.fn();

const initialProps = {
    setUsers: mockSetUsers,
    users: [],
};

const initialUser = { name: '', email: '', role: '' as USER_ROLE, password: '' };

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    test('should render component correctly', () => {
        render(<AddUserFormMittel {...initialProps} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    test.skip('should handle input changes', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');

        await userEvent.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');

        await userEvent.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');

        fireEvent.mouseDown(roleSelect);
        const listbox = screen.getByRole('listbox');
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test.skip('should show password error messages', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test.skip('should handle form submission', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        fireEvent.mouseDown(roleSelect);
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
        });
    });

    test.skip('should handle email already taken error', async () => {
        const propsWithUsers = {
            ...initialProps,
            users: [
                {
                    name: 'Existing User',
                    email: 'existing.user@example.com',
                    role: USER_ROLE.EMPLOYEE,
                    password: 'ExistingPassword123!',
                },
            ],
        };
        render(<AddUserFormMittel {...propsWithUsers} />);
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, 'existing.user@example.com');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    test.skip('should handle API error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: () => Promise.resolve({ message: 'Internal Server Error' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormMittel {...initialProps} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        fireEvent.mouseDown(roleSelect);
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });

        //global.fetch.mockClear();
    });

    test.skip('should close error alert on close button click', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, 'existing.user@example.com');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        const closeButton = screen.getByLabelText('close-icon');
        await userEvent.click(closeButton);

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
