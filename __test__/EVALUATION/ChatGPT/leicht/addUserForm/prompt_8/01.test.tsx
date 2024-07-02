import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: Verwendung von fireEvent
- critical: Verwendung von render in beforeEach

- keine Verwendung von Variablen, um setCall zu testen mit den Eingabedaten

- 4 von 4 notwendigem Testumfang erreicht + 4 Redundanzen

Best-Practices: -20
CleanCode: -5
Testumfang: 50
 */

describe('AddUserFormLeicht Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);
    });

    it('should show entered name', async () => {
        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'Jane');
        expect(nameInput).toHaveValue('Jane');
    });

    it('should show entered email', async () => {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should show entered password', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should show error for invalid password', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'pass');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('should show error for duplicate email', async () => {
        const existingUsers: User[] = [
            { name: 'John', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={existingUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'john@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should change role', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department field for non-customer roles', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should add user on valid form submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });
});
