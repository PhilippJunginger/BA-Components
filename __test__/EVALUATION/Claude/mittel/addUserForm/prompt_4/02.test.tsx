import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: waitFOr

- doppelung keine Variable - 2
- screen - 3
- typeerror


- 5 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -35
Testumfang: 58,45
 */

// Mock the fetch function
global.fetch = jest.fn();

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];
    const user = userEvent.setup();

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

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('shows department field for non-customer roles', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('validates password correctly', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Password'), 'weak');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();

        await user.clear(screen.getByLabelText('Password'));
        await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
    });

    it('handles form submission correctly', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ id: '1' }),
        });

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'StrongPass123!',
                    role: USER_ROLE.CUSTOMER,
                }),
            });
            expect(mockSetUsers).toHaveBeenCalled();
        });
    });

    it('shows error when email is already taken', async () => {
        const existingUser = { email: 'john@example.com' };
        render(<AddUserFormMittel setUsers={mockSetUsers} users={[existingUser]} />);

        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('shows error when API call fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('closes error alert when close button is clicked', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        await user.click(screen.getByLabelText('close-icon'));

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
