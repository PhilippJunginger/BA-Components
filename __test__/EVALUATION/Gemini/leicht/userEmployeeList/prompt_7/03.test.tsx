import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- node access

- unused import
- variable - 5

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -20
CleanCode: -30
Testumfang: 50,1
 */

const testUsers: UserNoPw[] = [
    { email: 'test@test.com', name: 'Test User', role: USER_ROLE.ADMIN },
    { email: 'jane@example.com', name: 'Jane Doe', role: USER_ROLE.EMPLOYEE },
    { email: 'john@example.com', name: 'John Smith', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    it('renders a list of users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        // Customer should be filtered out
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });

    it.skip('filters the list of users based on search input', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeVisible();
    });

    it.skip('sorts the list of users by name or email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByLabelText('Sort by');
        await userEvent.selectOptions(sortBySelect, 'email');
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('jane@example.com');

        await userEvent.selectOptions(sortBySelect, 'name');
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Jane Doe');
    });

    it('removes a user from the list when the delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteButton = screen.getByLabelText('delete-Jane Doe');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('displays a message when there are no users to display', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('displays a message when there are no users matching the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it.skip('renders correct icons based on user role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(
            screen.getByText('Test User').parentElement?.querySelector('svg[data-testid="BadgeIcon"]'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Jane Doe').parentElement?.querySelector('svg[data-testid="SupervisorAccountIcon"]'),
        ).toBeInTheDocument();
    });
});
