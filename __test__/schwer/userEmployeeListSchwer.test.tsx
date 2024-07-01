import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { User, USER_ROLE } from '../../models/user';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../components/schwierig/userEmployeeListSchwer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

jest.mock('next/router', () => ({
    ...jest.requireActual('next/router'),
    useRouter: jest.fn(),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0,
        },
    },
});

describe('Testing UserEmployeeListSchwer', () => {
    const user = userEvent.setup();
    const mockUsers: User[] = [
        { name: '1', role: USER_ROLE.EMPLOYEE, password: '124', email: '2@email.com' },
        { name: '2', role: USER_ROLE.ADMIN, password: '124', email: '1@email.com' },
    ];
    const mockRouter = {
        pathname: '/',
        push: jest.fn(),
        query: {
            shouldRoute: false,
        },
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    beforeEach(() => {
        jest.resetAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockUsers),
                    status: 200,
                }),
            ) as jest.Mock,
        );
    });

    it('should show alert, if no fetchedUsers are available', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                    status: 200,
                }),
            ) as jest.Mock,
        );
        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByText('No Users created')).toBeInTheDocument();
    });

    it('should show alert, if fetching users fails', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                    status: 300,
                }),
            ) as jest.Mock,
        );
        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('should show alert, if fetchedUsers only contains customers', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve([
                            { name: '2', role: USER_ROLE.CUSTOMER, password: '124', email: '1@email.com' },
                        ]),
                    status: 200,
                }),
            ) as jest.Mock,
        );

        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByRole('listitem', { name: mockUsers[0].name })).toBeInTheDocument();
        const sortedListItems = screen.getAllByRole('listitem');
        expect(sortedListItems[0]).toHaveTextContent(mockUsers[0].name);
        await user.click(screen.getByRole('radio', { name: 'Email' }));
        expect(sortedListItems[0]).toHaveTextContent(mockUsers[1].name);
    });

    it('should filter by search', async () => {
        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByRole('listitem', { name: mockUsers[0].name })).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Search Users' }), '1@');
        expect(screen.queryByRole('listitem', { name: mockUsers[0].name })).not.toBeInTheDocument();
    });

    it('should show alert, if search finds nothing', async () => {
        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByRole('listitem', { name: mockUsers[0].name })).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Search Users' }), 'Y');
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should show alert after filtering for role', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([mockUsers[0]]),
                    status: 200,
                }),
            ) as jest.Mock,
        );

        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByRole('listitem', { name: mockUsers[0].name })).toBeInTheDocument();
        await user.click(screen.getByRole('combobox'));
        await user.selectOptions(screen.getByRole('listbox'), screen.getByRole('option', { name: mockUsers[1].role }));

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should delete user from list', async () => {
        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByRole('listitem', { name: mockUsers[0].name })).toBeInTheDocument();

        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn((url: string) => {
                if (url.includes('user?email')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({}),
                        status: 200,
                    });
                } else {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve([mockUsers[1]]),
                        status: 200,
                    });
                }
            }) as jest.Mock,
        );

        await user.click(screen.getByRole('button', { name: `delete-${mockUsers[0].name}` }));
        expect(screen.queryByRole('listitem', { name: mockUsers[0].name })).not.toBeInTheDocument();
    });

    it('should show alert, if deletion fails', async () => {
        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByRole('listitem', { name: mockUsers[0].name })).toBeInTheDocument();

        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn((url: string) => {
                if (url.includes('user?email')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({}),
                        status: 400,
                    });
                }
            }) as jest.Mock,
        );
        await user.click(screen.getByRole('button', { name: `delete-${mockUsers[0].name}` }));
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should route to edit user page', async () => {
        render(<UserEmployeeListSchwer />, { wrapper });

        await user.click(await screen.findByRole('button', { name: `edit-${mockUsers[0].name}` }));
        expect(mockRouter.push).toHaveBeenCalledWith(`/edit/${mockUsers[0].name}`);
    });

    it('should not show button for next page', async () => {
        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByRole('listitem', { name: '2' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Go to page 2' })).not.toBeInTheDocument();
    });

    it('should show users of next page', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve([
                            ...mockUsers,
                            { name: '3', role: USER_ROLE.ADMIN, password: '124', email: '3@email.com' },
                            { name: '4', role: USER_ROLE.ADMIN, password: '124', email: '4@email.com' },
                            { name: '5', role: USER_ROLE.ADMIN, password: '124', email: '5@email.com' },
                            { name: '6', role: USER_ROLE.ADMIN, password: '124', email: '6@email.com' },
                        ]),
                    status: 200,
                }),
            ) as jest.Mock,
        );

        render(<UserEmployeeListSchwer />, { wrapper });

        expect(await screen.findByRole('listitem', { name: '5' })).toBeInTheDocument();
        expect(screen.queryByRole('listitem', { name: '6' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Go to page 2' }));
        expect(screen.getByRole('listitem', { name: '6' })).toBeInTheDocument();
    });
});
