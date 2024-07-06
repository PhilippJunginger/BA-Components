import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup

- variable - 3

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 1 Redundazen


Best-Practices: -10
CleanCode: -15
Testumfang: 58,45
 */

const testUsers: UserNoPw[] = [
    {
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        email: 'test.user@example.com',
        name: 'Test User',
        role: USER_ROLE.CUSTOMER,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render user list correctly', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        testUsers
            .filter((user) => user.role !== USER_ROLE.CUSTOMER)
            .forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('should sort users by name or email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('jane.doe@example.com');

        const sortByNameRadio = screen.getByLabelText('Name');
        await userEvent.click(sortByNameRadio);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('Jane Doe');
    });

    it.skip('should remove user from list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should display "no users available" alert when there are no users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display "no users matching" alert when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
