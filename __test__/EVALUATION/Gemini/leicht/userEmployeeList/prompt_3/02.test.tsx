import { render, screen, fireEvent } from '@testing-library/react';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent
- fireEvent

- variable - 4

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 1 Redundazen


Best-Practices: -30
CleanCode: -20
Testumfang: 58,45
 */

const generateTestUsers = (): UserNoPw[] => [
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
        name: 'Customer User',
        role: USER_ROLE.CUSTOMER,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    test.skip('renders the component with user list', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();

        // Should render all employees, but not the customer
        expect(screen.getByText('Admin User')).toBeVisible();
        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Customer User')).not.toBeInTheDocument();
    });

    test('renders "no users" message when user list is empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    test('filters the user list based on search term', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Employee' } });

        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });

    test('sorts the user list by name or email', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const sortByEmailRadio = screen.getByLabelText('Email');
        fireEvent.click(sortByEmailRadio);

        // Should be sorted by email ascending
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('admin@test.com');
        expect(userItems[1]).toHaveTextContent('employee1@test.com');
        expect(userItems[2]).toHaveTextContent('employee2@test.com');
    });

    test('removes a user from the list', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const deleteUserButton = screen.getByLabelText('delete-Employee One');
        fireEvent.click(deleteUserButton);

        expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
    });

    test('displays "no matching users" message when no users match the search', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'NonexistentUser' } });

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
