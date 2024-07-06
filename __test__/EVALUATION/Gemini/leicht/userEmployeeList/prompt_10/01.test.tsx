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
        name: 'test test',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'john.doe@email.com',
        name: 'John Doe',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        email: 'jane.doe@email.com',
        name: 'Jane Doe',
        role: USER_ROLE.EMPLOYEE,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render user list correctly', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it.skip('should sort users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[0]);
        expect(userNames).toEqual(['Jane Doe', 'John Doe', 'test test']);
    });

    it.skip('should sort users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[1]);
        expect(userEmails).toEqual(['jane.doe@email.com', 'john.doe@email.com', 'test@test.com']);
    });

    it('should remove user from list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('should display alert message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display alert message when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
