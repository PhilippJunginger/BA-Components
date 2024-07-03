import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent

- render Funkton erstellt
- initialProps spreading
- clean code: keine variablen erstellt - 2 mal
- TypeError


- 4 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -10
CleanCode: -25
Testumfang: 42,9
*/

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();

    const initialProps = {
        setUsers: jest.fn(),
        users: [],
    };

    const renderComponent = (props = initialProps) => render(<AddUserFormSchwer {...props} />);

    it.skip('should render all form fields correctly', () => {
        renderComponent();

        expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it.skip('should display validation errors for invalid password', async () => {
        renderComponent();

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');

        const errorMessages = await screen.findAllByRole('listitem');
        expect(errorMessages).toHaveLength(5);
    });

    it.skip('should show error message if email is already taken', async () => {
        const existingUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        const propsWithExistingUser = { ...initialProps, users: [existingUser] };

        renderComponent(propsWithExistingUser);

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Jane Doe');
        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        const errorAlert = await screen.findByRole('alert');
        expect(errorAlert).toHaveTextContent('Es ist ein Fehler aufgetreten!');
    });

    it.skip('should call setUsers with new user on successful form submission', async () => {
        renderComponent();

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Jane Doe');
        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'jane.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(initialProps.setUsers).toHaveBeenCalled();
            const updatedUsers = initialProps.setUsers.mock.calls[0][0];
            expect(updatedUsers).toHaveLength(1);
            expect(updatedUsers[0]).toMatchObject({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                role: USER_ROLE.ADMIN,
            });
        });
    });

    it.skip('should navigate to the correct URL after user is added and shouldRoute is true', async () => {
        const routerMock = { push: jest.fn(), query: { shouldRoute: 'true' } };
        jest.spyOn(require('next/router'), 'useRouter').mockReturnValue(routerMock);

        renderComponent();

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Jane Doe');
        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'jane.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(routerMock.push).toHaveBeenCalledWith(expect.stringContaining('http://localhost:3000/users?id='));
        });
    });

    it('should allow closing error alert', async () => {
        renderComponent();

        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'john.doe@example.com');
        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        const errorAlert = await screen.findByRole('alert');
        expect(errorAlert).toBeInTheDocument();

        await user.click(screen.getByLabelText('close-icon'));
        expect(errorAlert).not.toBeInTheDocument();
    });
});
