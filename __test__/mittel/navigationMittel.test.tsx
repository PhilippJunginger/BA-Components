import { render, screen } from '@testing-library/react';
import NavigationLeicht, { NavItem } from '../../components/leicht/navigationLeicht';
import { UserContext } from '../../pages';
import { User, USER_ROLE } from '../../models/user';
import userEvent from '@testing-library/user-event';
import NavigationMittel from '../../components/mittel/navigationMittel';
import { useRouter } from 'next/router';

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

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('navHistory', JSON.stringify([]));
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('should successfully delete NavItem for admin user', async () => {
        render(
            <UserContext.Provider value={adminUser}>
                <NavigationMittel
                    navItems={navItemsMock}
                    currentRequest={{
                        id: navItemsMock[0].requestId,
                        requestType: 'customer',
                        data: { name: navItemsMock[0].name },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('button', { name: 'delete-button' }));
        expect(handleRequestDeletionMock).toHaveBeenCalledWith(navItemsMock[0].requestId);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show dismissible alert, if deletion fails', async () => {
        render(
            <UserContext.Provider value={adminUser}>
                <NavigationMittel
                    navItems={navItemsMock}
                    currentRequest={{
                        id: navItemsMock[0].requestId,
                        requestType: 'customer',
                        data: { name: navItemsMock[0].name },
                    }}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
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
                <NavigationMittel
                    navItems={navItemsMock}
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
                <NavigationMittel
                    navItems={navItemsMock}
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
                <NavigationMittel
                    navItems={navItemsMock}
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
        );

        await user.click(screen.getByRole('tab', { name: navItemsMock[1].name }));
        expect(mockRouter.push).toHaveBeenCalledTimes(0);
    });

    it('should show alert, if there is no history available', () => {
        localStorage.clear();

        render(
            <UserContext.Provider value={customerUser}>
                <NavigationMittel
                    navItems={navItemsMock}
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
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('No history data available')).toBeInTheDocument();
    });

    it('should clear history entries', async () => {
        localStorage.setItem('navHistory', JSON.stringify([navItemsMock[1].name]));

        render(
            <UserContext.Provider value={customerUser}>
                <NavigationMittel
                    navItems={navItemsMock}
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
        );

        expect(screen.getByRole('paragraph', { name: navItemsMock[1].name })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Clear History' }));
        expect(screen.queryByRole('paragraph', { name: navItemsMock[1].name })).not.toBeInTheDocument();
    });
});
