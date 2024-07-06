import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- promises

- variable - 4
- const - 4
- typeerror

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 1 Redundazen


Best-Practices: -20
CleanCode: -45
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
        name: 'Test Customer',
        role: USER_ROLE.CUSTOMER,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    test('renders fetched users correctly', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        // Check that non-customer users are displayed
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Employee One')).toBeInTheDocument();
        expect(screen.getByText('Employee Two')).toBeInTheDocument();

        // Check that customer users are not displayed
        expect(screen.queryByText('Test Customer')).not.toBeInTheDocument();
    });

    test.skip('filters users based on search term', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        await userEvent.type(screen.getByLabelText('Search Users'), 'Employee');

        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeVisible();
    });

    test.skip('sorts users by name or email', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        // Default sorting (name)
        expect(screen.getByText('Admin User')).precede(screen.getByText('Employee One'));
        expect(screen.getByText('Employee One')).precede(screen.getByText('Employee Two'));

        // Sort by email
        await userEvent.click(screen.getByLabelText('Email'));
        expect(screen.getByText('admin@test.com')).precede(screen.getByText('employee1@test.com'));
        expect(screen.getByText('employee1@test.com')).precede(screen.getByText('employee2@test.com'));
    });

    test('removes user from list when delete button is clicked', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const deleteButton = screen.getByLabelText('delete-Employee One');
        await userEvent.click(deleteButton);

        expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
    });

    test('displays "no users available" message when no users are fetched', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    test('displays "no users matching" message when no filtered results', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        await userEvent.type(screen.getByLabelText('Search Users'), 'NonexistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
