import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- conditional assertion

- variable - 4

- 5 von 6 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 75,15
 */

const testUsers: UserNoPw[] = [
    { email: 'test@test.com', name: 'Test Test', role: USER_ROLE.ADMIN },
    { email: 'user@example.com', name: 'User Example', role: USER_ROLE.EMPLOYEE },
    { email: 'john.doe@email.com', name: 'John Doe', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render the component with the correct title', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should display a list of users when fetchedUsers is not empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        testUsers.forEach((user) => {
            if (user.role !== USER_ROLE.CUSTOMER) {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            }
        });
    });

    it('should filter the user list based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Test');
        expect(screen.getByText('Test Test')).toBeVisible();
        expect(screen.queryByText('User Example')).not.toBeInTheDocument();
    });

    it.skip('should sort the user list by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        await userEvent.click(nameRadio);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.trim());
        expect(userNames).toEqual(['Test Test', 'User Example']);
    });

    it.skip('should sort the user list by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.trim());
        expect(userEmails).toEqual(['test@test.com', 'user@example.com']);
    });

    it.skip('should remove a user from the list when the delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByLabelText('delete-')[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Test Test')).not.toBeInTheDocument();
    });

    it('should display a message when there are no users matching the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonexistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
