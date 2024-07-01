import { render, screen, waitFor } from '@testing-library/react';
import { NavItem } from '../../components/leicht/navigationLeicht';
import { UserContext } from '../../pages';
import { User, USER_ROLE } from '../../models/user';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import NavigationSchwer from '../../components/schwierig/navigationSchwer';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';

const customerUser: User = {
    name: 'Customer',
    email: 'email@test.com',
    password: '12345',
    role: USER_ROLE.CUSTOMER,
};

const employeeUser: User = {
    name: 'Employeee',
    email: 'email@test.com',
    password: '12345',
    role: USER_ROLE.EMPLOYEE,
    department: 'IT',
};

const adminUser: User = {
    name: 'ADMIN',
    email: 'email@test.com',
    password: '12345',
    role: USER_ROLE.ADMIN,
    department: 'IT',
};

const navItemsMock: NavItem[] = [
    { requestId: '1', requestType: 'admin', name: 'AdminItem' },
    { requestId: '2', requestType: 'customer', name: 'CustomerItem' },
    { requestId: '3', requestType: 'customer', name: 'CustomerItem2' },
    { requestId: '4', requestType: 'employee', name: 'EmployeeItem' },
    { requestId: '5', requestType: 'employee', name: 'EmployeeItem2' },
];

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

describe('Testing NavigationLeicht', () => {
    const user = userEvent.setup();
    const handleRequestDeletionMock = jest.fn().mockResolvedValue(undefined);
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
        jest.clearAllMocks();
        localStorage.setItem('navHistory', JSON.stringify([]));
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(navItemsMock),
                }),
            ) as jest.Mock,
        );
    });

    it('should successfully delete NavItem for admin user', async () => {
        render(
            <UserContext.Provider value={adminUser}>
                <NavigationSchwer
                    currentRequest={{
                        id: navItemsMock[0].requestId,
                        requestType: 'customer',
                        data: { name: navItemsMock[0].name },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock}
                />
            </UserContext.Provider>,
            { wrapper },
        );

        await user.click(await screen.findByRole('button', { name: 'delete-button' }));
        expect(handleRequestDeletionMock).toHaveBeenCalledWith(navItemsMock[0].requestId);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show dismissible alert, if deletion fails', async () => {
        render(
            <UserContext.Provider value={adminUser}>
                <NavigationSchwer
                    currentRequest={{
                        id: navItemsMock[0].requestId,
                        requestType: 'customer',
                        data: { name: navItemsMock[0].name },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
            { wrapper },
        );

        await user.click(screen.getByRole('button', { name: 'delete-button' }));

        expect(handleRequestDeletionMock).toHaveBeenCalledWith(navItemsMock[0].requestId);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Could not delete NavItem')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'close-alert' }));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should route to request as employee', async () => {
        render(
            <UserContext.Provider value={employeeUser}>
                <NavigationSchwer
                    currentRequest={{
                        id: navItemsMock[3].requestId,
                        requestType: navItemsMock[3].requestType,
                        data: {
                            name: navItemsMock[3].name,
                        },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
            { wrapper },
        );

        await user.click(screen.getByRole('tab', { name: navItemsMock[4].requestId }));
        expect(mockRouter.push).toHaveBeenCalledWith({
            pathname: '/request',
            query: { id: navItemsMock[4].requestId },
        });
        expect(screen.getByRole('paragraph', { name: navItemsMock[4].name })).toBeInTheDocument();
    });

    it('should route to request as customer', async () => {
        render(
            <UserContext.Provider value={customerUser}>
                <NavigationSchwer
                    currentRequest={{
                        id: navItemsMock[1].requestId,
                        requestType: navItemsMock[1].requestType,
                        data: {
                            name: navItemsMock[1].name,
                        },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
            { wrapper },
        );

        await user.click(screen.getByRole('tab', { name: navItemsMock[2].name }));
        expect(mockRouter.push).toHaveBeenCalledWith({
            pathname: '/request',
            query: { type: navItemsMock[2].requestType },
        });
        expect(screen.getByRole('paragraph', { name: navItemsMock[2].name })).toBeInTheDocument();
    });

    it('should not call changeToRequest, if clicked NavItem is currentItem', async () => {
        render(
            <UserContext.Provider value={customerUser}>
                <NavigationSchwer
                    currentRequest={{
                        id: navItemsMock[1].requestId,
                        requestType: navItemsMock[1].requestType,
                        data: {
                            name: navItemsMock[1].name,
                        },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
            { wrapper },
        );

        await user.click(screen.getByRole('tab', { name: navItemsMock[1].name }));
        expect(mockRouter.push).toHaveBeenCalledTimes(0);
    });

    it('should show alerts, if there is no history available and fetching NavItems failed', async () => {
        const fetch = jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 400,
                    json: () => Promise.resolve(new Error('Error')),
                }),
            ) as jest.Mock,
        );
        localStorage.clear();

        render(
            <UserContext.Provider value={customerUser}>
                <NavigationSchwer
                    currentRequest={{
                        id: navItemsMock[1].requestId,
                        requestType: navItemsMock[1].requestType,
                        data: {
                            name: navItemsMock[1].name,
                        },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
            { wrapper },
        );

        expect(screen.getByText('No history data available')).toBeInTheDocument();
        expect(await screen.findByText('Error while fetching Navigation Items')).toBeInTheDocument();
    });

    it('should clear history entries', async () => {
        localStorage.setItem('navHistory', JSON.stringify([navItemsMock[1].name]));

        render(
            <UserContext.Provider value={customerUser}>
                <NavigationSchwer
                    currentRequest={{
                        id: navItemsMock[1].requestId,
                        requestType: navItemsMock[1].requestType,
                        data: {
                            name: navItemsMock[1].name,
                        },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
            { wrapper },
        );

        expect(screen.getByRole('paragraph', { name: navItemsMock[1].name })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Clear History' }));
        expect(screen.queryByRole('paragraph', { name: navItemsMock[1].name })).not.toBeInTheDocument();
    });
});
