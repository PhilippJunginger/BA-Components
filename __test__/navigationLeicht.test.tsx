import { render, screen } from '@testing-library/react';
import NavigationLeicht, { NavItem } from '../components/leicht/navigationLeicht';
import { UserContext } from '../pages';
import { USER_ROLE } from '../models/user';
import userEvent from '@testing-library/user-event';

const adminUserMock = {
    email: 'email@email.com',
    role: USER_ROLE.ADMIN,
    name: 'Test',
    department: 'IT',
    password: 'hallo123',
};
const employeeUserMock = { ...adminUserMock, role: USER_ROLE.EMPLOYEE };
const customerUserMock = { ...adminUserMock, role: USER_ROLE.CUSTOMER };
const navItemsMock: NavItem[] = [
    { requestId: '1', requestType: 'customer', name: 'CustomerItem' },
    { requestId: '12', requestType: 'employee', name: 'EmployeeItem' },
    { requestId: '123', requestType: 'admin', name: 'AdminItem' },
];

describe('Testin NavigationLeicht', () => {
    const changeToRequestMock = jest.fn();
    const handleRequestDeletionSuccessMock = jest.fn(() => Promise.resolve());

    const user = userEvent.setup();

    it('should render for empty NavItems', () => {
        render(
            <UserContext.Provider value={adminUserMock}>
                <NavigationLeicht
                    navItems={[]}
                    currentRequest={{ id: '123', requestType: 'employee', data: {} }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionSuccessMock}
                />
            </UserContext.Provider>,
        );

        expect(screen.queryAllByRole('tab').length).toBe(0);
    });

    it('should try to delete NavItem for admins but fail and show dismissible alert', async () => {
        render(
            <UserContext.Provider value={adminUserMock}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{ id: '123', requestType: 'employee', data: {} }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={jest.fn().mockRejectedValue(new Error('Test'))}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('button', { name: 'delete-button' }));
        expect(screen.getByRole('alert')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'close-alert' }));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should allow delete NavItem for admins', async () => {
        render(
            <UserContext.Provider value={adminUserMock}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{ id: '123', requestType: 'employee', data: {} }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionSuccessMock}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('button', { name: 'delete-button' }));
        expect(handleRequestDeletionSuccessMock).toHaveBeenCalledWith('123');
    });

    it('should call changeToRequest correctly for customer', async () => {
        render(
            <UserContext.Provider value={customerUserMock}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{ id: '12', requestType: 'customer', data: {} }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionSuccessMock}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('tab', { name: 'customer' }));
        expect(changeToRequestMock).toHaveBeenCalledWith('customer', 'requestType');
    });

    it('should call changeToRequest correctly for not customer', async () => {
        render(
            <UserContext.Provider value={employeeUserMock}>
                <NavigationLeicht
                    navItems={navItemsMock}
                    currentRequest={{ id: '12', requestType: 'employee', data: {} }}
                    changeToRequest={changeToRequestMock}
                    handleRequestDeletion={handleRequestDeletionSuccessMock}
                />
            </UserContext.Provider>,
        );

        await user.click(screen.getByRole('tab', { name: '12' }));
        expect(changeToRequestMock).toHaveBeenCalledWith('12', 'id');
    });
});
