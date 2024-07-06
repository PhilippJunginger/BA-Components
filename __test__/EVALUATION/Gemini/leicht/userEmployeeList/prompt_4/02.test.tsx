import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- promise

- unnecessary funktion

- 5 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -20
CleanCode: -5
Testumfang: 66,8
 */

const generateTestUsers = (): UserNoPw[] => [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: USER_ROLE.ADMIN,
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        name: 'Peter Pan',
        email: 'peter.pan@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    test('renders the component with user list', () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText(users[0].name)).toBeInTheDocument();
        expect(screen.getByText(users[1].name)).toBeInTheDocument();
    });

    test('filters the user list based on search term', async () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');

        expect(screen.getByText(users[0].name)).toBeVisible();
        expect(screen.queryByText(users[1].name)).not.toBeInTheDocument();
    });

    test.skip('sorts the user list by name', async () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent(users[0].name);
        expect(userItems[1]).toHaveTextContent(users[1].name);
    });

    test('sorts the user list by email', async () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent(users[1].name);
        expect(userItems[1]).toHaveTextContent(users[0].name);
    });

    test.skip('removes a user from the list', async () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);

        expect(screen.queryByText(users[0].name)).not.toBeInTheDocument();
    });

    test('displays a message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    test('displays a message when no users match the search criteria', async () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    test('filters out customer role users', () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        expect(screen.queryByText(users[2].name)).not.toBeInTheDocument();
    });
});
