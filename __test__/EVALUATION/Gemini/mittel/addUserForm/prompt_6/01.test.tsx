import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render in beofreEach

- userEvent.setzuo dippelung
- doppelung keine variable - 1
- TypeError - 2

- 3 von 6 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -10
CleanCode: -20
Testumfang: 41,75
 */

// Mock fetch to control the API response
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const initialUsers = [];

    beforeEach(() => {
        jest.clearAllMocks();
        render(<AddUserFormMittel users={initialUsers} setUsers={mockSetUsers} />);
    });

    it('should display form fields and submit button', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should show validation errors for password', async () => {
        const user = userEvent.setup();
        await user.type(screen.getByLabelText('Password'), 'short');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            // ... other password validation errors
        });
    });

    it('should show error when email is already taken', async () => {
        const user = userEvent.setup();
        const existingUserEmail = 'test@example.com';
        render(<AddUserFormMittel users={[{ ...initialUser, email: existingUserEmail }]} setUsers={mockSetUsers} />);

        await user.type(screen.getByLabelText('Email'), existingUserEmail);
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('should add a new user and update user list', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...initialUser, id: 1 }),
        });

        const user = userEvent.setup();
        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPassword123!');
        await user.selectOptions(screen.getByRole('combobox'), USER_ROLE.ADMIN);
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                expect.objectContaining({
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.ADMIN,
                }),
            ]);
        });
    });

    // ... more tests for other functionalities (e.g., role selection, department field visibility)
});
