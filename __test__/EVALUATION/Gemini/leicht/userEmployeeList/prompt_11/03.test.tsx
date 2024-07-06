import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- setup
- fireEvent
- no assertion

- variable -4

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -30
CleanCode: -20
Testumfang: 58,45
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

        // Should only display employees and admins
        expect(screen.getByText('Admin User')).toBeVisible();
        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Test Customer')).not.toBeInTheDocument();
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'Employee');
        expect(screen.getByText('Employee One')).toBeVisible();
        expect(screen.getByText('Employee Two')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();

        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, 'admin@test.com');
        expect(screen.getByText('Admin User')).toBeVisible();
        expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
        expect(screen.queryByText('Employee Two')).not.toBeInTheDocument();
    });

    it.skip('should sort users by name or email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const sortBy = screen.getByLabelText('Sort by');
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        // Default sorting should be by name
        expect(nameRadio).toBeChecked();
        expect(screen.getByText('Admin User')).toBeVisible();

        fireEvent.click(emailRadio);
        expect(emailRadio).toBeChecked();
        expect(screen.getByText('admin@test.com')).toBeVisible();
    });

    it('should remove user from the list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        fireEvent.click(deleteButton);

        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });

    it('should display "no matching users" message when search yields no results', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
