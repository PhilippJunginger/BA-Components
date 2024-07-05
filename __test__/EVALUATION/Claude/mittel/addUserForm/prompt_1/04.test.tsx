import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- setup
- fireEvent

- doppelung keine Variable - 3
- screen - 2
- const

- 5 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -20
CleanCode: -30
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
    const mockUsers: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component correctly', () => {
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

    it('shows department field for non-customer roles', async () => {
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

        await userEvent.type(screen.getByLabelText('Password'), 'weak');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText('Password'));
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
    });

    it('handles form submission correctly', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'StrongPass123!',
                }),
            });
        });

        expect(mockSetUsers).toHaveBeenCalled();
    });

    it('shows error when email is already taken', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'password',
        };
        render(<AddUserFormMittel setUsers={mockSetUsers} users={[existingUser]} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('handles API error correctly', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ error: 'API Error' }),
                status: 400,
            }),
        ) as jest.Mock;

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('closes error alert when close icon is clicked', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // Trigger an error
        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('close-icon'));
        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
