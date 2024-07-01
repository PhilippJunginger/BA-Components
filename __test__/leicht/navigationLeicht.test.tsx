import { render, screen } from '@testing-library/react';
import NavigationLeicht, { NavItem } from '../../components/leicht/navigationLeicht';
import { UserContext } from '../../pages';
import { User, USER_ROLE } from '../../models/user';
import userEvent from '@testing-library/user-event';

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

describe('Testing NavigationLeicht', () => {
    const user = userEvent.setup();
    const changeToRequestMock = jest.fn();
    const handleRequestDeletionMock = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully delete NavItem for admin user', async () => {
        render(
            <UserContext.Provider value={adminUser}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{ id: navItemsMock[0].requestId, requestType: 'customer', data: {} }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionMock}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('button', { name: 'delete-button' }));
        expect(handleRequestDeletionMock).toHaveBeenCalledWith(navItemsMock[0].requestId);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show dismissable alert, if deletion fails', async () => {
        render(
            <UserContext.Provider value={adminUser}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{ id: navItemsMock[0].requestId, requestType: 'customer', data: {} }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('button', { name: 'delete-button' }));

        expect(handleRequestDeletionMock).toHaveBeenCalledWith(navItemsMock[0].requestId);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'close-alert' }));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should call changeToRequest for employee', async () => {
        render(
            <UserContext.Provider value={employeeUser}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{
                        id: navItemsMock[3].requestId,
                        requestType: navItemsMock[3].requestType,
                        data: {},
                    }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('tab', { name: navItemsMock[4].requestId }));
        expect(changeToRequestMock).toHaveBeenCalledWith(navItemsMock[4].requestId, 'id');
    });

    it('should call changeToRequest for customer', async () => {
        render(
            <UserContext.Provider value={customerUser}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{
                        id: navItemsMock[1].requestId,
                        requestType: navItemsMock[1].requestType,
                        data: {},
                    }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('tab', { name: navItemsMock[2].name }));
        expect(changeToRequestMock).toHaveBeenCalledWith(navItemsMock[2].requestType, 'requestType');
    });

    it('should not call changeToRequest, if clicked NavItem is currentItem', async () => {
        render(
            <UserContext.Provider value={customerUser}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{
                        id: navItemsMock[1].requestId,
                        requestType: navItemsMock[1].requestType,
                        data: {
                            name: navItemsMock[1].name,
                        },
                    }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionMock.mockRejectedValue(undefined)}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('tab', { name: navItemsMock[1].name }));
        expect(changeToRequestMock).toHaveBeenCalledTimes(0);
    });
});
