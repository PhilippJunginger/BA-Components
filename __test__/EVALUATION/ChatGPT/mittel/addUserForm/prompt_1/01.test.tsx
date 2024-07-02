import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical eslint error: userEvent Promise not handled
- critical: kein userEvent.setup()


- clean code: unused import
- clean code: Doppelung - keine variablen erstellt in zweitem test - 3 mal

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: -10
CleanCode: -20
Testumfang: 33,4
 */

// Mock fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    const renderComponent = () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders component correctly', () => {
        renderComponent();

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('updates state on input change', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'P@ssw0rd!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('P@ssw0rd!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test('displays password error messages', async () => {
        renderComponent();

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('shows error when email is already taken', async () => {
        const existingUsers = [{ ...mockUsers, email: 'john.doe@example.com' }];
        render(<AddUserFormMittel setUsers={mockSetUsers} users={existingUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'P@ssw0rd!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await screen.findByText('Es ist ein Fehler aufgetreten!');
    });

    test('handles add user success', async () => {
        renderComponent();

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'P@ssw0rd!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() =>
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'P@ssw0rd!',
                },
            ]),
        );
    });

    test('handles fetch error', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                status: 500,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        );

        renderComponent();

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'P@ssw0rd!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await screen.findByText('Es ist ein Fehler aufgetreten!');
    });
});
