import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../models/user';
import AddUserFormLeicht from '../../../../../components/leicht/addUserFormLeicht';

/*
- critical eslint error: userEvent Promise not handled
- critical best-practice: userEvent.setup not used
- critical best-practice: Verwendung von fireEvent
- unnecessary creation of render function

- 4 von 4 notwendigen Testfälen erreicht + 5 Redundanzen

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -20
CleanCode: -5
Testumfang: 37.5
 */

const mockSetUsers = jest.fn();

const initialProps = {
    users: [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE, password: 'Password1!' }],
    setUsers: mockSetUsers,
};

const renderComponent = (props = initialProps) => {
    render(<AddUserFormLeicht {...props} />);
};

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders the form with initial state', () => {
        renderComponent();

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });

    test('updates name state on input change', () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/Name/i);

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        expect(nameInput).toHaveValue('Jane Doe');
    });

    test('updates email state on input change', () => {
        renderComponent();
        const emailInput = screen.getByLabelText(/Email/i);

        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
        expect(emailInput).toHaveValue('jane@example.com');
    });

    test.skip('shows error if email is already taken', async () => {
        renderComponent();
        const emailInput = screen.getByLabelText(/Email/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        await userEvent.click(submitButton);

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test('shows password error if password does not meet criteria', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.change(passwordInput, { target: { value: 'weakpass' } });
        await userEvent.click(submitButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test('updates password state on input change', () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });
        expect(passwordInput).toHaveValue('StrongPass1!');
    });

    test.skip('updates role state on input change', () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/Role/i);

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test.skip('shows department field when role is not customer', () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/Role/i);

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not show department field when role is customer', () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/Role/i);

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });

    test.skip('calls setUsers with new user on valid form submission', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialProps.users,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ]);
    });
});
