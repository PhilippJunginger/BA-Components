import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- doppelung variablen nicht benutzt - 1 mal
- setup FUnktion

- 1 von 4 notwendigem Testumfang erreicht


Best-Practices: 0
CleanCode: -10
Testumfang: 25

 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const existingUsers: User[] = [
        { name: 'Existing', email: 'existing@test.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
    ];

    const setup = (users: User[] = []) => {
        render(<AddUserFormLeicht users={users} setUsers={mockSetUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('adds a new user with valid data', async () => {
        setup();

        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'SecurePassword123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        await user.type(screen.getByLabelText('Department'), 'Engineering');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...existingUsers,
            {
                name: 'John Doe',
                email: 'john@example.com',
                role: USER_ROLE.EMPLOYEE,
                password: 'SecurePassword123!',
                department: 'Engineering',
            },
        ]);
    });

    // ... tests for email validation, password validation, empty fields, role selection, error clearing, etc.
});
