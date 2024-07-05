import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*


- setup
- doppelung keine Variable - 2
- typeerror
- screen
- waitFor unnecessary - 2


- 5 von 6 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: 0
CleanCode: -35
Testumfang: 66,8
 */

const mockSetUsers = jest.fn();
const mockUsers = [{ email: 'existing@example.com' }];

describe('AddUserFormMittel', () => {
    const renderComponent = () => render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({}),
        });
    });

    it('renders the form with all required fields', () => {
        renderComponent();
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('displays department field when role is ADMIN or EMPLOYEE', async () => {
        renderComponent();
        const user = userEvent.setup();
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('validates password and shows error messages', async () => {
        renderComponent();
        const user = userEvent.setup();
        const passwordInput = screen.getByLabelText('Password');

        await user.type(passwordInput, 'weak');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();

        await user.clear(passwordInput);
        await user.type(passwordInput, 'StrongP@ss1');
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
    });

    it('prevents submission when email already exists', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.type(screen.getByLabelText('Password'), 'StrongP@ss1');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('successfully adds a new user', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.type(screen.getByLabelText('Email'), 'jane@example.com');
        await user.type(screen.getByLabelText('Password'), 'StrongP@ss1');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                expect.objectContaining({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    role: USER_ROLE.CUSTOMER,
                }),
            ]);
        });
    });

    it('handles API error when adding a new user', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Smith');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'StrongP@ss1');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('closes the error alert when clicking the close icon', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        await user.click(screen.getByLabelText('close-icon'));

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
