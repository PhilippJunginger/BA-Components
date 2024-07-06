import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup

- variable - 4

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -10
CleanCode: -20
Testumfang: 58,45
 */

const testUsers: UserNoPw[] = [
    {
        email: 'test@test.com',
        name: 'John Doe',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'test2@test.com',
        name: 'Jane Doe',
        role: USER_ROLE.EMPLOYEE,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render user list correctly', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it.skip('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeVisible();
    });

    it.skip('should sort users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('John Doe');
        expect(userItems[1]).toHaveTextContent('Jane Doe');
    });

    it.skip('should sort users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Jane Doe');
        expect(userItems[1]).toHaveTextContent('John Doe');
    });

    it.skip('should remove user from list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getByLabelText('delete-Jane Doe');
        await userEvent.click(deleteUserButton);
        expect(screen.queryByText('Jane Doe')).not.toBeVisible();
    });

    it('should display alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display alert when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
