import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- fireEvent
- promises

- vairablen - 5

- 5 von 6 notwendigen Testfälen erreicht + 1 A + 1 Redundanzen


Best-Practices: -30
CleanCode: -20
Testumfang: 75,15
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Customer User', email: 'customer@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    test('renders component with fetched users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText(/User List/i)).toBeInTheDocument();
        expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByLabelText('Customer User')).not.toBeInTheDocument();
    });

    test('displays message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText(/There are no users available/i)).toBeInTheDocument();
    });

    test('filters users based on search input', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText(/Search Users/i);
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
    });

    test('displays message when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText(/Search Users/i);
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText(/There are no users matching the current search/i)).toBeInTheDocument();
    });

    test('sorts users by name', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const nameSortRadio = screen.getByLabelText(/Name/i);
        fireEvent.click(nameSortRadio);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Jane Smith');
        expect(userItems[1]).toHaveTextContent('John Doe');
    });

    test('sorts users by email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const emailSortRadio = screen.getByLabelText(/Email/i);
        fireEvent.click(emailSortRadio);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('jane@example.com');
        expect(userItems[1]).toHaveTextContent('john@example.com');
    });

    test('removes user from list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText(/delete-John Doe/i);
        fireEvent.click(deleteButton);
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
    });
});
