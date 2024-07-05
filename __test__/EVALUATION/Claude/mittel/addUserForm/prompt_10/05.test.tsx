import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- render

- doppelung keine Variable - 3
- waitFor unnecessary - 1
- typeerror
- setup


- 5 von 6 notwendigem Testumfang erreicht + 1 A + 3 Redundant


Best-Practices: -10
CleanCode: -30
Testumfang: 58,45
 */

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [{ email: 'existing@example.com', name: 'Existing User', role: USER_ROLE.CUSTOMER }];

    const renderComponent = () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({ id: '1' }),
        });
    });

    it('renders the component correctly', () => {
        renderComponent();
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
    });

    it('shows password error when password is invalid', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Password'), 'weak');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('selects a role from the dropdown', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Role')).toHaveTextContent(USER_ROLE.ADMIN);
    });

    it('shows department field for non-customer roles', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('submits the form successfully', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalled();
        });
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', expect.any(Object));
    });

    it('shows error when email is already taken', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'Existing User');
        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('shows error when API call fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('closes the error alert when close icon is clicked', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        const closeIcon = await screen.findByLabelText('close-icon');
        await user.click(closeIcon);

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
