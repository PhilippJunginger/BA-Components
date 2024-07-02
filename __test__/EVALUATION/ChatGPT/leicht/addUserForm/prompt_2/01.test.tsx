import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical error: Verwendung von fireEvent
- critical error: did not instantiate userEvent.setup()
- unnecessary creation of render function

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + eine Redundanz

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -20
CleanCode: -5
Testumfang: 87.5
 */

const mockSetUsers = jest.fn();
const mockUsers: User[] = [
    { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
];

const renderComponent = () => render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form correctly', () => {
        renderComponent();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should update the name state on input change', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/name/i);
        await userEvent.type(nameInput, 'New User');
        expect(nameInput).toHaveValue('New User');
    });

    it('should update the email state on input change', async () => {
        renderComponent();
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'newuser@example.com');
        expect(emailInput).toHaveValue('newuser@example.com');
    });

    it('should update the password state on input change', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it.skip('should update the role state on select change', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it.skip('should show department field if role is ADMIN or EMPLOYEE', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it.skip('should not show department field if role is CUSTOMER', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it.skip('should display error if email already exists', async () => {
        renderComponent();
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'existing@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        expect(screen.getByText(/email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should display error if password does not meet criteria', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'weakpass');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('should call setUsers with new user if form is valid', async () => {
        renderComponent();
        await userEvent.type(screen.getByLabelText(/name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/email/i), 'newuser@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password123!',
            },
        ]);
    });
});
