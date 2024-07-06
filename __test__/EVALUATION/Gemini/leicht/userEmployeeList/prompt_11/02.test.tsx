import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- setup

- unused import
- const - 5
- variable -4

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 1 Redundazen


Best-Practices: -10
CleanCode: -50
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

        // Check if non-customer users are displayed
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Employee One')).toBeInTheDocument();
        expect(screen.getByText('Employee Two')).toBeInTheDocument();

        // Check if customer user is not displayed
        expect(screen.queryByText('Test Customer')).not.toBeInTheDocument();
    });

    test.skip('filters users based on search input', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Employee');

        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeVisible();
    });

    test('sorts users by name or email correctly', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        // Sort by email
        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('admin@test.com'); // Admin user should be first when sorted by email

        // Sort by name
        const nameSortRadio = screen.getByLabelText('Name');
        await userEvent.click(nameSortRadio);

        // Re-query list items after re-render
        const updatedListItems = screen.getAllByRole('listitem');
        expect(updatedListItems[0]).toHaveTextContent('Admin User'); // Admin user should be first when sorted by name
    });

    test.skip('removes a user from the list', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const userToDelete = 'employee1@test.com';
        const deleteButton = screen.getByLabelText(`delete-${userToDelete}`);
        await userEvent.click(deleteButton);

        expect(screen.queryByText(userToDelete)).not.toBeInTheDocument();
    });

    test('displays "no users" message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    test('displays "no matching users" message when search yields no results', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonexistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
