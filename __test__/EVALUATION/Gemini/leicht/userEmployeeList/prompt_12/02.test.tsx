import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- conditional assertion
- interface usage

- variable
- typeerror
- render fnktion
- props spreading

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 50,1
 */

const generateTestUsers = (numUsers: number): UserNoPw[] => {
    const users: UserNoPw[] = [];
    for (let i = 0; i < numUsers; i++) {
        users.push({
            email: `test${i}@test.com`,
            name: `Test User ${i}`,
            role: i % 2 === 0 ? USER_ROLE.ADMIN : USER_ROLE.EMPLOYEE,
        });
    }
    return users;
};

const setup = (props: any = {}) => {
    const fetchedUsers = generateTestUsers(5);
    const defaultProps = {
        fetchedUsers,
    };
    const mergedProps = { ...defaultProps, ...props };
    render(<UserEmployeeListLeicht {...mergedProps} />);
    return {
        fetchedUsers,
        ...mergedProps,
    };
};

describe('UserEmployeeListLeicht Component', () => {
    const user = userEvent.setup();

    it('should render the component', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a list of users', () => {
        const { fetchedUsers } = setup();
        fetchedUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter the list of users based on search term', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Test User 1');
        expect(screen.getByText('Test User 1')).toBeVisible();
        expect(screen.queryByText('Test User 0')).not.toBeInTheDocument();
    });

    it('should sort the list of users by name', async () => {
        setup();
        const nameRadioButton = screen.getByLabelText('Name');
        await user.click(nameRadioButton);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[0]);
        expect(userNames).toEqual(userNames.slice().sort());
    });

    it('should sort the list of users by email', async () => {
        setup();
        const emailRadioButton = screen.getByLabelText('Email');
        await user.click(emailRadioButton);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[1]);
        expect(userEmails).toEqual(userEmails.slice().sort());
    });

    it('should remove a user from the list', async () => {
        const { fetchedUsers } = setup();
        const userToRemove = fetchedUsers[0];
        const deleteButton = screen.getByLabelText(`delete-${userToRemove.name}`);
        await user.click(deleteButton);
        expect(screen.queryByText(userToRemove.name)).not.toBeInTheDocument();
    });

    it('should display a message when there are no users', () => {
        setup({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display a message when there are no users matching the search', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
