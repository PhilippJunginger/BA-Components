import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- promises

- variable - 4

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 50,1
 */

const testUsers: UserNoPw[] = [
    {
        email: 'test.user@test.com',
        name: 'Test User',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        email: 'admin.user@test.com',
        name: 'Admin User',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'customer.user@test.com',
        name: 'Customer User',
        role: USER_ROLE.CUSTOMER,
    },
];

describe('UserEmployeeListLeicht', () => {
    it('should render the component', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        const listComponent = screen.getByRole('list');
        expect(listComponent).toBeInTheDocument();
    });

    it('should display a message if there are no users available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        const emptyUserMessage = screen.getByText('There are no users available');
        expect(emptyUserMessage).toBeVisible();
    });

    it('should display a list of users if users are passed in', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const listItems = screen.getAllByRole('listitem');
        // Should only be 2, as customer users should be filtered out
        expect(listItems).toHaveLength(2);
    });

    it('should filter the list of users based on the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Admin');
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(1);
        expect(screen.getByText('Admin User')).toBeVisible();
    });

    it('should sort the list of users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Admin User');
        expect(listItems[1]).toHaveTextContent('Test User');
    });

    it('should sort the list of users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('admin.user@test.com');
        expect(listItems[1]).toHaveTextContent('test.user@test.com');
    });

    it('should remove a user from the list when the delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getByLabelText('delete-Test User');
        await userEvent.click(deleteUserButton);
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('should display a message if there are no users matching the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Non-Existent User');
        const noMatchingUsersMessage = screen.getByText('There are no users matching the current search');
        expect(noMatchingUsersMessage).toBeVisible();
    });
});
