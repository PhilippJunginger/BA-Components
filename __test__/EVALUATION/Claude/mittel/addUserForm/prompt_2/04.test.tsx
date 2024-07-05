import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: keine Verwendung von USERROLE enum

- doppelung keine Variable - 3
- screen - 2
- setup

- 5 von 6 notwendigem Testumfang erreicht + 1 A + 3 Redundazen


Best-Practices: -10
CleanCode: -30
Testumfang: 58,45
 */

// Mock the fetch function
global.fetch = jest.fn();

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER }];

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

    it('updates form fields when user types', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'Jane Smith');
        await user.type(screen.getByLabelText('Email'), 'jane@example.com');
        await user.type(screen.getByLabelText('Password'), 'P@ssw0rd');

        expect(screen.getByLabelText('Name')).toHaveValue('Jane Smith');
        expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('P@ssw0rd');
    });

    it('displays password error when password is invalid', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Password'), 'weak');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('shows department field when role is ADMIN or EMPLOYEE', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText('ADMIN'));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText('EMPLOYEE'));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('does not show department field when role is CUSTOMER', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText('CUSTOMER'));

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('displays error when email is already taken', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'P@ssw0rd');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText('CUSTOMER'));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('successfully adds a new user', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ id: '1' }),
        });

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'Jane Smith');
        await user.type(screen.getByLabelText('Email'), 'jane@example.com');
        await user.type(screen.getByLabelText('Password'), 'P@ssw0rd');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText('CUSTOMER'));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    role: 'CUSTOMER',
                    password: 'P@ssw0rd',
                }),
            });
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'CUSTOMER',
                password: 'P@ssw0rd',
            },
        ]);
    });

    it('displays error when API call fails', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'Jane Smith');
        await user.type(screen.getByLabelText('Email'), 'jane@example.com');
        await user.type(screen.getByLabelText('Password'), 'P@ssw0rd');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText('CUSTOMER'));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('closes the error alert when close icon is clicked', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'P@ssw0rd');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText('CUSTOMER'));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        await user.click(screen.getByLabelText('close-icon'));

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
