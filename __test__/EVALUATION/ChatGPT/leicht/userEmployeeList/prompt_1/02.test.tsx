import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- fireEvent
- node access
- promises

- vairablen - 4

- 5 von 6 notwendigen Testfälen erreicht + 1 A + 4 Redundanzen


Best-Practices: -30
CleanCode: -20
Testumfang: 33,4
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.ADMIN },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    test('renders User List title', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    test.skip('renders sort options', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    test('renders search input', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
    });

    test('displays "no users available" alert when no users are fetched', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('filters users by search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test.skip('sorts users by name', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const sortByName = screen.getByLabelText('Name');
        fireEvent.click(sortByName);
        const users = screen.getAllByRole('listitem');
        expect(users[0]).toHaveTextContent('Alice Johnson');
        expect(users[1]).toHaveTextContent('Jane Smith');
        expect(users[2]).toHaveTextContent('John Doe');
    });

    test.skip('sorts users by email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const sortByEmail = screen.getByLabelText('Email');
        fireEvent.click(sortByEmail);
        const users = screen.getAllByRole('listitem');
        expect(users[0]).toHaveTextContent('Alice Johnson');
        expect(users[1]).toHaveTextContent('Jane Smith');
        expect(users[2]).toHaveTextContent('John Doe');
    });

    test('removes user from list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        fireEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('displays correct icon for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const adminIcon = screen.getByLabelText('Jane Smith').querySelector('svg');
        const employeeIcon = screen.getByLabelText('John Doe').querySelector('svg');
        expect(adminIcon).toBeInTheDocument();
        expect(employeeIcon).toBeInTheDocument();
    });

    test('displays "no users matching search" alert when search term does not match any user', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
