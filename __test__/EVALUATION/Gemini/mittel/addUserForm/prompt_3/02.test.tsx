import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent
- no userEvent
- usage of vitest

- Doppelung variablen - 3

- 4 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -40
CleanCode: -15
Testumfang: 50,1
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

// Mock the fetch function
global.fetch = vi.fn();

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'P@ssw0rd' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput.value).toBe('Test User');
        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('P@ssw0rd');
        expect(roleSelect.value).toBe(USER_ROLE.ADMIN);
    });

    it('validates password correctly', () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByText('Add User');

        // Invalid password
        fireEvent.change(passwordInput, { target: { value: 'pass' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Valid password
        fireEvent.change(passwordInput, { target: { value: 'P@ssw0rd' } });
        fireEvent.click(submitButton);

        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeVisible();
    });

    it('displays an error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={() => {}} />);

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(emailInput, { target: { value: 'test1@example.com' } });
        fireEvent.click(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('adds a new user successfully', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ id: 2 }),
            status: 201,
        });

        const setUsersMock = vi.fn();
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'P@ssw0rd' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(setUsersMock).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'P@ssw0rd',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(roleSelect.value).toBe('');
    });

    it('handles API errors gracefully', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockRejectedValueOnce(new Error('API Error'));

        render(<AddUserFormMittel users={mockUsers} setUsers={() => {}} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'P@ssw0rd' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
