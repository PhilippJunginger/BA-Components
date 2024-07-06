import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- setup
- node access
- conditional assertion
- no assertion
- fireEvent

- variable -4

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -50
CleanCode: -20
Testumfang: 50,1
 */

const testUsers: UserNoPw[] = [
    {
        email: 'admin@test.com',
        name: 'Admin User',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'employee1@test.com',
        name: 'Employee One',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        email: 'employee2@test.com',
        name: 'Employee Two',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        email: 'customer@test.com',
        name: 'Test Customer',
        role: USER_ROLE.CUSTOMER,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render without crashing', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
    });

    it('should display "no users" message when the list is empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display user list correctly', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        testUsers.forEach((user) => {
            if (user.role !== USER_ROLE.CUSTOMER) {
                expect(screen.getByText(user.name)).toBeVisible();
                expect(screen.getByText(user.email)).toBeVisible();
            }
        });
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Employee');
        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });

    it('should sort users by name or email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const sortByEmailRadio = screen.getByLabelText('Email');
        fireEvent.click(sortByEmailRadio);
        expect(screen.getByText('admin@test.com')).toBeVisible();

        const sortByNameRadio = screen.getByLabelText('Name');
        fireEvent.click(sortByNameRadio);
        expect(screen.getByText('Admin User')).toBeVisible();
    });

    it('should remove user from list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const userToDelete = testUsers.find((user) => user.email === 'employee1@test.com');
        const deleteButton = screen.getByLabelText(`delete-${userToDelete?.name}`);
        fireEvent.click(deleteButton);
        expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
    });

    it('should display "no matching users" message when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonexistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it.skip('should display correct icon based on user role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(
            screen.getByText('Admin User').parentElement?.querySelector('svg[data-testid="BadgeIcon"]'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Employee One').parentElement?.querySelector('svg[data-testid="SupervisorAccountIcon"]'),
        ).toBeInTheDocument();
    });
});
