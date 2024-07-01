import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../models/user';
import AddUserFormSchwer from '../../components/schwierig/addUserFormSchwer';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
    ...jest.requireActual('next/router'),
    useRouter: jest.fn(),
}));

describe('Testing AddUserFormSchwer', () => {
    const user = userEvent.setup();
    const setUserMock = jest.fn();
    const mockRouter = {
        pathname: '/',
        push: jest.fn(),
        query: {
            shouldRoute: false,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('should show department field when role is not customer', async () => {
        render(<AddUserFormSchwer setUsers={setUserMock} users={[]} />);

        await user.click(screen.getByRole('combobox'));
        await user.selectOptions(screen.getByRole('listbox'), screen.getByRole('option', { name: 'ADMIN' }));
        expect(screen.getByRole('textbox', { name: 'Department' })).toBeInTheDocument();
    });

    it('should show error, if email is already taken and close error on click', async () => {
        render(
            <AddUserFormSchwer
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

        expect(screen.getByRole('alert')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'close-icon' }));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show password error', async () => {
        render(<AddUserFormSchwer setUsers={setUserMock} users={[]} />);

        await user.type(screen.getByRole('textbox', { name: 'Password' }), 'Passw678');

        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should not update users, if password has error', async () => {
        const fetch = jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({}),
                }),
            ) as jest.Mock,
        );

        render(<AddUserFormSchwer setUsers={setUserMock} users={[]} />);

        await user.type(screen.getByRole('textbox', { name: 'Password' }), 'Passw678');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(fetch).toHaveBeenCalledTimes(0);
    });

    describe('should update users', () => {
        const userId = '123';

        beforeEach(() => {
            jest.spyOn(global, 'fetch').mockImplementation(
                jest.fn(() =>
                    Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({ userId }),
                    }),
                ) as jest.Mock,
            );
        });

        it('without routing', async () => {
            render(<AddUserFormSchwer setUsers={setUserMock} users={[]} />);

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
            expect(mockRouter.push).toHaveBeenCalledTimes(0);
        });

        it('with routing', async () => {
            (useRouter as jest.Mock).mockReturnValue({ ...mockRouter, query: { shouldRoute: 'true' } });

            render(<AddUserFormSchwer setUsers={setUserMock} users={[]} />);

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
            expect(mockRouter.push).toHaveBeenCalledWith(`http://localhost:3000/users?id=${userId}`);
        });
    });

    it('should show error, if creation of user fails', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 400,
                    json: () => Promise.resolve(),
                }),
            ) as jest.Mock,
        );

        render(<AddUserFormSchwer setUsers={setUserMock} users={[]} />);

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

        expect(setUserMock).toHaveBeenCalledTimes(0);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
});
