import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render

- doppelung keine Variable - 3
- screen -
- typeerror
- waitFor unnecessary - 2


- 5 von 6 notwendigem Testumfang erreicht + 2 A + 3 Redundazen


Best-Practices: -10
CleanCode: -30
Testumfang: 58,45
 */

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];
    const user = userEvent.setup();

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('should render the form with all required fields', () => {
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should update form fields when user types', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should show password error messages for invalid password', async () => {
        const passwordInput = screen.getByLabelText('Password');

        await user.type(passwordInput, 'weak');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should not show password error messages for valid password', async () => {
        const passwordInput = screen.getByLabelText('Password');

        await user.type(passwordInput, 'StrongPass1!');

        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
        expect(
            screen.queryByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Needs to contain at least one digit')).not.toBeInTheDocument();
        expect(screen.queryByText('Needs to contain at least one special character')).not.toBeInTheDocument();
    });

    it('should allow selecting a role', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(roleSelect).toHaveTextContent(USER_ROLE.ADMIN);
    });

    it('should show department field for ADMIN and EMPLOYEE roles', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.EMPLOYEE));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not show department field for CUSTOMER role', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should show error when email is already taken', async () => {
        const existingUser = { email: 'existing@example.com' };
        render(<AddUserFormMittel setUsers={mockSetUsers} users={[existingUser]} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, 'existing@example.com');
        await user.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('should successfully add a new user', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({ id: '1' }),
        });

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'StrongPass1!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: USER_ROLE.CUSTOMER,
                    }),
                ]),
            );
        });

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveTextContent('');
    });

    it('should show error when user creation fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'StrongPass1!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });
});
