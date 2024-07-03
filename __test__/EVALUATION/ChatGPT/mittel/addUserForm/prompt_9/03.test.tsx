import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: promises not handled
- critical: render in beforeEach

- unused import
- initialProps spreading
- unnecessary waitFor - 2 mal


- 3 von 6 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -20
Testumfang: 25,05
*/

const mockSetUsers = jest.fn();

const initialProps = {
    setUsers: mockSetUsers,
    users: [],
};

const newUser: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: USER_ROLE.CUSTOMER,
    password: 'Password123!',
};

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        render(<AddUserFormMittel {...initialProps} />);
    });

    it('renders the form correctly', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('handles input change', async () => {
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, newUser.name);
        expect(nameInput).toHaveValue(newUser.name);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, newUser.email);
        expect(emailInput).toHaveValue(newUser.email);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, newUser.password);
        expect(passwordInput).toHaveValue(newUser.password);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(roleSelect).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('validates password correctly', async () => {
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(passwordInput, 'short');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();

        await userEvent.type(passwordInput, 'NoSpecialChar123');
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('shows error when email is already taken', async () => {
        const propsWithExistingUser = {
            ...initialProps,
            users: [newUser],
        };
        render(<AddUserFormMittel {...propsWithExistingUser} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, newUser.email);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('adds new user successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve(newUser),
            }),
        ) as jest.Mock;

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, newUser.name);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, newUser.email);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, newUser.password);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([newUser]);
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });
});
