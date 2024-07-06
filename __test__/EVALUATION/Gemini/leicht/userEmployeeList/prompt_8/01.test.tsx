import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup

- variable - 5

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -10
CleanCode: -25
Testumfang: 58,45
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
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render the component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it.skip('should filter the user list based on search input', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'Test');
        expect(screen.getByText('Test User')).toBeVisible();
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });

    it('should sort the user list by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadio = screen.getByLabelText('Name');

        await userEvent.click(nameRadio);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Admin User');
        expect(userItems[1]).toHaveTextContent('Test User');
    });

    it('should sort the user list by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadio = screen.getByLabelText('Email');

        await userEvent.click(emailRadio);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('admin.user@test.com');
        expect(userItems[1]).toHaveTextContent('test.user@test.com');
    });

    it('should remove a user from the list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getByLabelText('delete-Test User');

        await userEvent.click(deleteUserButton);
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('should display a message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display a message when no users match the search criteria', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
