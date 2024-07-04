import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent
- no userEvent
- usage of vitest

- Doppelung variablen - 4
- TypeError

- 3 von 6 notwendigem Testumfang erreicht + 3 Redudndanz


Best-Practices: -40
CleanCode: -25
Testumfang: 41,75
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testpassword1!',
    },
];

// Mock the fetch function
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormMittel Component', () => {
    it('renders the form correctly', () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        fireEvent.change(nameInput, { target: { value: 'Test Name' } });
        fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Testpassword1!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput.value).toBe('Test Name');
        expect(emailInput.value).toBe('test@email.com');
        expect(passwordInput.value).toBe('Testpassword1!');
        expect(roleSelect.value).toBe(USER_ROLE.ADMIN);
    });

    it('validates password correctly', () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByText('Add User');

        // Test with an invalid password
        fireEvent.change(passwordInput, { target: { value: 'test' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Test with a valid password
        fireEvent.change(passwordInput, { target: { value: 'Testpassword1!' } });
        fireEvent.click(submitButton);

        expect(screen.queryByText('Password needs to be 8 characters long')).toBeNull();
    });

    it('displays an error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={() => {}} />);

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.click(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form successfully and resets the form', async () => {
        const setUsersMock = vi.fn();
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@email.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Testpassword1!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        await expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@email.com',
                password: 'Testpassword1!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'newuser@email.com',
                password: 'Testpassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(roleSelect.value).toBe('');
    });

    it('displays an error message if adding user fails', async () => {
        // Mock fetch to throw an error
        global.fetch = vi.fn(() => Promise.reject(new Error('Failed to create user'))) as jest.Mock;

        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@email.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Testpassword1!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
