import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- fireEvent
- render in beforeEach
- assertions waitFor

- fill out Funktion
- doppelung variablen nicht benutzt - 1 mal
- TypeError

- 3 von 4 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -15
Testumfang: 37,5

 */

// Helper function to fill out the form
const fillOutForm = async (user: Partial<User>) => {
    const userSim = userEvent.setup();

    await userSim.type(screen.getByLabelText('Name'), user.name || '');
    await userSim.type(screen.getByLabelText('Email'), user.email || '');
    await userSim.type(screen.getByLabelText('Password'), user.password || '');

    if (user.role) {
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: user.role } });

        if (user.department && (user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.EMPLOYEE)) {
            await userSim.type(screen.getByLabelText('Department'), user.department);
        }
    }

    await userSim.click(screen.getByRole('button', { name: 'Add User' }));
};

describe('AddUserFormLeicht', () => {
    const setUsers = jest.fn();
    let users: User[] = [];

    beforeEach(() => {
        users = [];
        setUsers.mockClear();
        render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    });

    it('adds a new user on successful submission', async () => {
        const newUser: User = {
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: 'SecurePassword123!',
            role: USER_ROLE.CUSTOMER,
        };

        await fillOutForm(newUser);

        expect(setUsers).toHaveBeenCalledWith([...users, newUser]);
    });

    it('clears the form after successful submission', async () => {
        await fillOutForm({
            name: 'Jane Smith',
            email: 'janesmith@example.com',
            password: 'AnotherSecurePassword123!',
            role: USER_ROLE.ADMIN,
            department: 'Marketing',
        });

        await waitFor(() => {
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(screen.getByLabelText('Email')).toHaveValue('');
            expect(screen.getByLabelText('Password')).toHaveValue('');
            expect(screen.getByLabelText('Role')).toHaveValue('');
            expect(screen.getByLabelText('Department')).toHaveValue(''); // For Admin role
        });
    });

    it('displays an error when email is already taken', async () => {
        users = [{ ...initialUser, email: 'duplicate@example.com' }];
        render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

        await fillOutForm({ ...initialUser, email: 'duplicate@example.com' });
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(setUsers).not.toHaveBeenCalled();
    });

    // ... similar tests for password validation, role-based department visibility, etc.
});
