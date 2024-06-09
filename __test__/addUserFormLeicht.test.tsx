import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../models/user';
import AddUserFormLeicht from '../components/leicht/addUserFormLeicht';

describe('Testing AddUserFormLeicht', () => {
    let props: AddUserDialogProps;
    let user: User;

    beforeEach(() => {
        user = {
            name: 'Test User',
            email: 'testuser@gmail.com',
            role: USER_ROLE.ADMIN,
            password: 'Test@1234',
        };

        props = {
            users: [],
            setUsers: jest.fn(),
        };

        render(<AddUserFormLeicht {...props} />);
    });

    it('should render the component with the correct fields', () => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Password' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should update state when input fields are changed', () => {
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
            target: { value: user.name },
        });
        fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
            target: { value: user.email },
        });
        fireEvent.change(screen.getByRole('textbox', { name: 'Password' }), {
            target: { value: user.password },
        });

        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(user.name);
        expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue(user.email);
        expect(screen.getByRole('textbox', { name: 'Password' })).toHaveValue(user.password);
    });

    it('should call setUsers when the form is submitted', async () => {
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
            target: { value: user.name },
        });
        fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
            target: { value: user.email },
        });
        fireEvent.change(screen.getByRole('textbox', { name: 'Password' }), {
            target: { value: user.password },
        });

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(props.setUsers).toHaveBeenCalledTimes(1);
    });

    it('should not call setUsers when the form is submitted with an existing email', async () => {
        props.users.push(user);

        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
            target: { value: user.name },
        });
        fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
            target: { value: user.email },
        });
        fireEvent.change(screen.getByRole('textbox', { name: 'Password' }), {
            target: { value: user.password },
        });

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(props.setUsers).toHaveBeenCalledTimes(0);
    });
});
