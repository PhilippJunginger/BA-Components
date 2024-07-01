import { render, screen } from '@testing-library/react';
import AddUserFormLeicht from '../../components/leicht/addUserFormLeicht';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../models/user';

describe('Testing AddUserFormLeicht', () => {
    const user = userEvent.setup();
    const setUserMock = jest.fn();

    it('should show department field when role is not customer', async () => {
        render(<AddUserFormLeicht setUsers={setUserMock} users={[]} />);

        await user.click(screen.getByRole('combobox'));
        await user.selectOptions(screen.getByRole('listbox'), screen.getByRole('option', { name: 'ADMIN' }));
        expect(screen.getByRole('textbox', { name: 'Department' })).toBeInTheDocument();
    });

    it('should show email error, if email is already taken', async () => {
        render(
            <AddUserFormLeicht
                setUsers={setUserMock}
                users={[{ name: 'Test', email: 'test@email.com', role: USER_ROLE.CUSTOMER, password: '1234' }]}
            />,
        );

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Name');
        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'test@email.com');
        await user.type(screen.getByRole('textbox', { name: 'Password' }), 'P@ssw678');
        await user.click(screen.getByRole('combobox'));
        await user.selectOptions(screen.getByRole('listbox'), screen.getByRole('option', { name: 'ADMIN' }));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error', async () => {
        render(<AddUserFormLeicht setUsers={setUserMock} users={[]} />);

        await user.type(screen.getByRole('textbox', { name: 'Password' }), 'Passw678');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should update existing users', async () => {
        render(<AddUserFormLeicht setUsers={setUserMock} users={[]} />);

        const newUser: User = {
            name: 'Name',
            email: 'test@email.com',
            role: USER_ROLE.CUSTOMER,
            password: 'P@ssw678',
        };

        await user.type(screen.getByRole('textbox', { name: 'Name' }), newUser.name);
        await user.type(screen.getByRole('textbox', { name: 'Email' }), newUser.email);
        await user.type(screen.getByRole('textbox', { name: 'Password' }), newUser.password);
        await user.click(screen.getByRole('combobox'));
        await user.selectOptions(screen.getByRole('listbox'), screen.getByRole('option', { name: newUser.role }));

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(setUserMock).toHaveBeenCalledWith([newUser]);
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
    });
});
