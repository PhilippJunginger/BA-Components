import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical error: Verwendung von fireEvent
- critical error: did not instantiate userEvent.setup()
- komplizierte Verwendung von initialProps

- 4 von 4 notwendigem Testumfang erreicht + 4 Redundanzen

Statement: 0
Branch: 0
Functions: 0
Lines: 0

Best-Practices: -20
CleanCode: -5
Testumfang: 50
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const initialProps = {
        setUsers: mockSetUsers,
        users: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form fields correctly', () => {
        render(<AddUserFormLeicht {...initialProps} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should update the name field value', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const nameInput = screen.getByLabelText(/Name/i);

        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
    });

    it('should update the email field value', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const emailInput = screen.getByLabelText(/Email/i);

        await userEvent.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it('should update the password field value', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const passwordInput = screen.getByLabelText(/Password/i);

        await userEvent.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should show password validation error', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const passwordInput = screen.getByLabelText(/Password/i);
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(passwordInput, 'short');
        fireEvent.click(addUserButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it.skip('should show email already exists error', async () => {
        const propsWithUsers = {
            ...initialProps,
            users: [
                { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.EMPLOYEE, password: 'Password123!' },
            ],
        };
        render(<AddUserFormLeicht {...propsWithUsers} />);
        const emailInput = screen.getByLabelText(/Email/i);
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(emailInput, 'jane.doe@example.com');
        fireEvent.click(addUserButton);

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    it.skip('should add a new user successfully', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const addUserButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        fireEvent.click(addUserButton);

        expect(mockSetUsers).toHaveBeenCalledWith(
            expect.arrayContaining([
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                },
            ]),
        );
    });

    it.skip('should show department field when role is ADMIN or EMPLOYEE', async () => {
        render(<AddUserFormLeicht {...initialProps} />);
        const roleSelect = screen.getByLabelText(/Role/i);

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
