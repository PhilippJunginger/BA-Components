import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- fireEvent
- filter logic inside test

- variable - 4
- unnecessary Funktion

- 5 von 6 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -30
CleanCode: -25
Testumfang: 75,15
 */

const generateTestUsers = (): UserNoPw[] => [
    {
        email: 'test.user@test.com',
        name: 'Test User',
        role: USER_ROLE.CUSTOMER,
    },
    {
        email: 'admin.user@test.com',
        name: 'Admin User',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'employee.user@test.com',
        name: 'Employee User',
        role: USER_ROLE.EMPLOYEE,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    test('renders with no users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        const messageElement = screen.getByText('There are no users available');
        expect(messageElement).toBeInTheDocument();
    });

    test('renders with users', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        testUsers
            .filter((user) => user.role !== USER_ROLE.CUSTOMER)
            .forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
    });

    test('filters users by name', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Employee');
        expect(screen.getByText('Employee User')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    test('filters users by email', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'admin.user');
        expect(screen.getByText('Admin User')).toBeVisible();
        expect(screen.queryByText('Employee User')).not.toBeInTheDocument();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    test('shows no users message when no matches', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        const messageElement = screen.getByText('There are no users matching the current search');
        expect(messageElement).toBeInTheDocument();
    });

    test('sorts users by name', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);
        const userItems = screen.getAllByRole('listitem');
        // Note: Excluding the customer as they are filtered out
        expect(userItems[0].textContent).toContain('Admin User');
        expect(userItems[1].textContent).toContain('Employee User');
    });

    test('sorts users by email', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);
        const userItems = screen.getAllByRole('listitem');
        // Note: Excluding the customer as they are filtered out
        expect(userItems[0].textContent).toContain('admin.user@test.com');
        expect(userItems[1].textContent).toContain('employee.user@test.com');
    });

    test('removes user from list', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getAllByRole('button', { name: /delete/i })[0];
        fireEvent.click(deleteUserButton);
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });
});
