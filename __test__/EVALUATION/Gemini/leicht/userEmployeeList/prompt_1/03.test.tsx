import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- mnode access

- unused import
- unnecessary Funktion


- 5 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -20
CleanCode: -10
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
        name: 'David Lee',
        email: 'david.lee@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    test('renders the component with user list', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText(testUsers[0].name)).toBeInTheDocument();
        expect(screen.getByText(testUsers[1].name)).toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText(testUsers[0].name)).toBeVisible();
        expect(screen.queryByText(testUsers[1].name)).not.toBeInTheDocument();
    });

    test.skip('sorts users by name', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent(testUsers[0].name);
        expect(userItems[1]).toHaveTextContent(testUsers[1].name);
    });

    test.skip('sorts users by email', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent(testUsers[0].name);
        expect(userItems[1]).toHaveTextContent(testUsers[1].name);
    });

    test('removes user from the list', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const removeUserButton = screen.getByLabelText(`delete-${testUsers[0].name}`);
        await userEvent.click(removeUserButton);
        expect(screen.queryByText(testUsers[0].name)).not.toBeInTheDocument();
    });

    it('should display a message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display a message when no users match the search criteria', async () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it.skip('should display the correct icon based on user role', () => {
        const testUsers = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(screen.getByText(testUsers[0].name).parentElement?.querySelector('svg')).toHaveAttribute(
            'data-testid',
            'BadgeIcon',
        );
        expect(screen.getByText(testUsers[1].name).parentElement?.querySelector('svg')).toHaveAttribute(
            'data-testid',
            'SupervisorAccountIcon',
        );
    });
});
