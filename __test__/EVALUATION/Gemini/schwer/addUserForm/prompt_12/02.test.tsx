import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- setup

- tyoerror - 2
- variable -3

- 3 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -25
Testumfang: 25,05
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

// Mock useRouter to handle routing actions
jest.mock('next/router', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            query: { shouldRoute: 'false' },
        };
    },
}));

// Mock fetch to control API responses
global.fetch = jest.fn();

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockReset();
    });

    it('should render all form fields', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should update input fields correctly', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(nameInput, 'Test Name');
        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'Test1234!');

        expect(nameInput).toHaveValue('Test Name');
        expect(emailInput).toHaveValue('test@test.com');
        expect(passwordInput).toHaveValue('Test1234!');
    });

    it('should select a role from the dropdown', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByRole('option', { name: USER_ROLE.ADMIN }).selected).toBeTruthy();
    });

    it('should display password validation errors', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should display an error message if email is already taken', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
        });

        render(<AddUserFormSchwer setUsers={() => {}} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });

    it('should successfully submit the form with valid data', async () => {
        const mockSetUsers = jest.fn();
        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
        });

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    id: '',
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'Test1234!',
                    role: USER_ROLE.ADMIN,
                },
            ]);
        });
    });
});
