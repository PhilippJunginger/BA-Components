import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import { useState } from 'react';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt
- fireEvent

- unused import
- unnecessary mock
- TypeError - 2

- 3 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -20
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    role: USER_ROLE.EMPLOYEE,
    password: 'NewPassword1!',
    department: 'Test Department',
};

const mockSetUsers = jest.fn();
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        (jest.mocked(useState) as jest.Mock).mockImplementationOnce((initial) => [initial, jest.fn()]);
        (jest.mocked(useState) as jest.Mock).mockImplementationOnce((initial) => [initial, jest.fn()]);
        (jest.mocked(useState) as jest.Mock).mockImplementationOnce((initial) => [initial, jest.fn()]);
    });

    it('renders the form correctly', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('select-label')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('select-label');
        const departmentInput = screen.getByLabelText('Department');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.type(departmentInput, mockNewUser.department);

        expect(nameInput).toHaveValue(mockNewUser.name);
        expect(emailInput).toHaveValue(mockNewUser.email);
        expect(passwordInput).toHaveValue(mockNewUser.password);
        expect(roleSelect).toHaveValue(mockNewUser.role);
        expect(departmentInput).toHaveValue(mockNewUser.department);
    });

    it('validates password correctly', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        const addButton = screen.getByText('Add User');

        // Invalid password
        await userEvent.type(passwordInput, 'short');
        await userEvent.click(addButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.click(addButton);
        expect(screen.queryByText('Password needs to be 8 characters long')).toBeNull();
    });

    it('handles email validation and user creation', async () => {
        const fetchMock = jest.spyOn(window, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({}),
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('select-label');
        const addButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.click(addButton);

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify(mockNewUser),
        });

        // Check for successful user creation
        expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, mockNewUser]);
    });

    it('handles errors during user creation', async () => {
        const fetchMock = jest.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('API request failed'));

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('select-label');
        const addButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.click(addButton);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
