import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- promise
- filter in test

- variable - 2
- unused import

- 5 von 6 notwendigem Testumfang erreicht + 1 A + 1 Redundazen


Best-Practices: -30
CleanCode: -15
Testumfang: 75,15
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
        name: 'Customer One',
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

        testUsers
            .filter((user) => user.role !== USER_ROLE.CUSTOMER)
            .forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
                expect(screen.getByText(user.email)).toBeVisible();
            });
    });

    test('filters the user list based on search input', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Employee');

        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });

    test('sorts the user list by name or email', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);

        const emailOrder = testUsers
            .filter((user) => user.role !== USER_ROLE.CUSTOMER)
            .sort((a, b) => a.email.localeCompare(b.email))
            .map((user) => user.email);

        const emailElements = screen.getAllByText(/.*@.*/);
        emailElements.forEach((element, index) => {
            expect(element.textContent).toEqual(emailOrder[index]);
        });
    });

    test('removes a user from the list', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const userToDelete = testUsers.find((user) => user.email === 'employee1@test.com');
        const deleteButton = screen.getByLabelText(`delete-${userToDelete?.name}`);
        await userEvent.click(deleteButton);

        expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
    });

    test('displays a message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    test('displays a message when no users match the search criteria', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonexistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    test('filters out customer users from the list', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const customerUser = testUsers.find((user) => user.role === USER_ROLE.CUSTOMER);
        expect(screen.queryByText(customerUser?.email as string)).not.toBeInTheDocument();
    });
});
