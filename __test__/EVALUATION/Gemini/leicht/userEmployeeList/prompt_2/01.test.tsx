import { render, screen, fireEvent } from '@testing-library/react';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent
- fireEvent

- variable - 2

- 5 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -30
CleanCode: -10
Testumfang: 66,8
 */

const generateTestUsers = (numUsers: number): UserNoPw[] => {
    const users: UserNoPw[] = [];
    for (let i = 0; i < numUsers; i++) {
        users.push({
            email: `test${i}@example.com`,
            name: `Test User ${i}`,
            role: i % 2 === 0 ? USER_ROLE.ADMIN : USER_ROLE.EMPLOYEE,
        });
    }
    return users;
};

describe('UserEmployeeListLeicht Component', () => {
    const testUsers: UserNoPw[] = generateTestUsers(5);

    it('renders without crashing', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('renders the correct number of users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(testUsers.length);
    });

    it('filters users based on search term', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Test User 1' } });
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('sorts users by name', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.includes('Test User'));
        expect(userNames).toEqual([true, true, true, true, true]);
    });

    it('sorts users by email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.includes('@example.com'));
        expect(userEmails).toEqual([true, true, true, true, true]);
    });

    it('removes a user from the list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const firstDeleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        fireEvent.click(firstDeleteButton);
        expect(screen.getAllByRole('listitem')).toHaveLength(testUsers.length - 1);
    });

    it('displays a message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('displays a message when no users match the search criteria', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Nonexistent User' } });
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
