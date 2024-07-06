import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- promises
- no asertion

- unused import
- variable - 2

- 5 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -30
CleanCode: -15
Testumfang: 66,8
 */

const testUsers: UserNoPw[] = [
    { email: 'admin@test.com', name: 'Admin User', role: USER_ROLE.ADMIN },
    { email: 'employee1@test.com', name: 'Employee One', role: USER_ROLE.EMPLOYEE },
    { email: 'employee2@test.com', name: 'Employee Two', role: USER_ROLE.EMPLOYEE },
    { email: 'customer@test.com', name: 'Customer User', role: USER_ROLE.CUSTOMER }, // Should be filtered out
];

describe('UserEmployeeListLeicht Component', () => {
    it('renders without crashing', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
    });

    it('renders the correct number of users (excluding customers)', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const listItems = screen.getAllByRole('listitem');
        // Expect one less than total test users as customer should be filtered
        expect(listItems).toHaveLength(testUsers.length - 1);
    });

    it('renders "no users" message correctly', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('filters users based on search input', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Employee');
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(2); // Only two employees in test data
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0].textContent).toContain('Admin User'); // Should be first alphabetically
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0].textContent).toContain('admin@test.com'); // Should be first alphabetically
    });

    it('removes a user from the list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0]; // Get first delete button
        await userEvent.click(deleteButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(testUsers.length - 2); // One less than initial visible users
    });

    it.skip('displays correct user icons', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const adminIcon = screen.getByTitle('Badge'); // Assuming BadgeIcon has title 'Badge'
        const employeeIcon = screen.getAllByTitle('Supervisor Account'); // Assuming SupervisorAccountIcon has title 'Supervisor Account'
        expect(adminIcon).toBeVisible();
        expect(employeeIcon.length).toBe(2);
    });
});
