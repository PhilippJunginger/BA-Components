import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- setup

- inused import
- doppelung keine Variable - 3
- screen - 2
- typeerror
- waitFor unnecessary - 2


- 5 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -45
Testumfang: 58,45
 */

// Mock fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [{ email: 'existing@example.com', name: 'Existing User', role: USER_ROLE.CUSTOMER }];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('displays department field for non-customer roles', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('validates password correctly', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'weak');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'StrongPass123!');

        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
    });

    it('prevents submission when email is already taken', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('successfully adds a new user', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'StrongPass123!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('handles API error when adding user', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({ message: 'API Error' }),
                status: 400,
            }),
        );

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });

        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('closes the error alert when clicking the close icon', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText('close-icon'));

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
