import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent missing
- fireEvent

- doppelung keine Variable - 2
- typeError - 2

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -30
CleanCode: -20
Testumfang: 33,4
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test.user@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
            query: {},
        });
    });

    it('renders correctly', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'new.user@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'test1234' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput).toHaveValue('New User');
        expect(emailInput).toHaveValue('new.user@test.com');
        expect(passwordInput).toHaveValue('test1234');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('validates password correctly', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        fireEvent.change(passwordInput, { target: { value: 'test' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('shows error message for duplicate email', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={mockUsers} />);
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByText('Add User');

        fireEvent.change(emailInput, { target: { value: mockUsers[0].email } });
        fireEvent.click(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits form data correctly', async () => {
        const mockFetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ userId: '2' }),
                status: 200,
            }),
        );
        global.fetch = mockFetch;

        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={[]} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'new.user@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        fireEvent.click(submitButton);

        await expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'new.user@test.com',
                password: 'Test1234!',
                role: USER_ROLE.ADMIN,
            }),
        });

        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'new.user@test.com',
                password: 'Test1234!',
                role: USER_ROLE.ADMIN,
            },
        ]);
    });
});
