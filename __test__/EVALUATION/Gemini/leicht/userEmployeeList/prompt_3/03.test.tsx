import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent
- fireEvent
- node access

- unused import
- variable - 5

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -40
CleanCode: -30
Testumfang: 50,1
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

        // Check that only employees and admins are rendered
        expect(screen.getByText('Admin User')).toBeVisible();
        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Customer User')).not.toBeInTheDocument();
    });

    test('renders "no users" message when user list is empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('filters the user list based on search term', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'employee' } });

        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });

    test.skip('sorts the user list by name or email', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const sortBySelect = screen.getByLabelText('Sort by');

        // Sort by email
        fireEvent.click(screen.getByLabelText('Email'));
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('admin@test.com');

        // Sort by name
        fireEvent.click(screen.getByLabelText('Name'));
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('Admin User');
    });

    test.skip('removes a user from the list', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const userToDelete = screen.getByText('Employee One').closest('li')!;
        const deleteButton = userToDelete.querySelector('button[aria-label="delete-Employee One"]')!;

        fireEvent.click(deleteButton);
        expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
    });

    test('displays "no matching users" message when no users match the search', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'nonexistentuser' } });

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays correct user icons based on role', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const adminUserIcon = screen.getByText('Admin User').closest('li')?.querySelector('svg');
        const employeeUserIcon = screen.getByText('Employee One').closest('li')?.querySelector('svg');

        // Assuming BadgeIcon is used for admins and SupervisorAccountIcon for employees
        expect(adminUserIcon).toHaveAttribute('data-testid', expect.stringContaining('BadgeIcon'));
        expect(employeeUserIcon).toHaveAttribute('data-testid', expect.stringContaining('SupervisorAccountIcon'));
    });
});
