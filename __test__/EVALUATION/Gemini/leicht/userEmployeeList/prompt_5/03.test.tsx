import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- render in beofreEach

- variable - 3
- unused import

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 50,1
 */

const generateTestUsers = (numUsers: number): UserNoPw[] => {
    const users: UserNoPw[] = [];
    for (let i = 0; i < numUsers; i++) {
        users.push({
            name: `Test User ${i + 1}`,
            email: `test${i + 1}@test.com`,
            role: i % 3 === 0 ? USER_ROLE.ADMIN : USER_ROLE.EMPLOYEE,
        });
    }
    return users;
};

const testUsers = generateTestUsers(5);

describe('UserEmployeeListLeicht Component', () => {
    beforeEach(() => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
    });

    it('renders the component title', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('renders the correct number of user list items', () => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(testUsers.length);
    });

    it('filters users based on search input', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Test User 3');
        expect(screen.getByText('Test User 3')).toBeVisible();
        expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Test User 1');
    });

    it('sorts users by email', async () => {
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('test1@test.com');
    });

    it('removes a user from the list when delete button is clicked', async () => {
        const firstDeleteButton = screen.getAllByRole('button', {
            name: /delete/i,
        })[0];
        await userEvent.click(firstDeleteButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(testUsers.length - 1);
    });

    it('displays a message when there are no users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('displays a message when there are no search results', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
