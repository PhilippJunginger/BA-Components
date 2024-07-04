import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- assetions waitFor
- userEvent.setuo missing

- TypeError - 4

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 50,1
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'Testpassword1!',
    role: USER_ROLE.ADMIN,
    department: 'Test Department',
};

const setUsersMock = jest.fn();

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all fields', () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should render department field for admin and employee roles', async () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should handle form submission correctly', async () => {
        const createUserMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ id: '2', ...mockNewUser }),
        } as Response);

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(createUserMock).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify(mockNewUser),
            });
            expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { id: '2', ...mockNewUser }]);
        });
    });

    it('should display error message on duplicate email', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });

    it('should display error message on invalid password', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Password'), 'Test1');
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        });
    });

    it('should clear form after successful submission', async () => {
        const createUserMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ id: '2', ...mockNewUser }),
        } as Response);

        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(createUserMock).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify(mockNewUser),
            });

            expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('');
            expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('');
            expect((screen.getByLabelText('Password') as HTMLInputElement).value).toBe('');
            expect((screen.getByLabelText('Role') as HTMLSelectElement).value).toBe('');
            expect((screen.getByLabelText('Department') as HTMLInputElement).value).toBe('');
        });
    });
});
