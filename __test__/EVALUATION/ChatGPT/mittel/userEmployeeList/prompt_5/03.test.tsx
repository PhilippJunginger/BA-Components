import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- setup

- unused import
- vairablen - 7
- enum
- typeerror

- 8 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -50
Testumfang: 70
 */

// Mock useRouter from next/router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
useRouter.mockImplementation(() => ({
    push: mockPush,
}));

const users: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Brown', email: 'bob@example.com', role: USER_ROLE.ADMIN },
    { name: 'Carol White', email: 'carol@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    test('renders component with initial users', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByText('Sort by')).toBeInTheDocument();
        expect(screen.getByText('Filter by Role')).toBeInTheDocument();
    });

    test('search filters the user list correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).toBeNull();
    });

    test('sort by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        await userEvent.click(screen.getByLabelText('Email'));
        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('Alice Johnson');
        expect(userList[1]).toHaveTextContent('Bob Brown');
    });

    test.skip('filter by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        await userEvent.selectOptions(screen.getByLabelText('Filter by Role'), 'ADMIN');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).toBeNull();
    });

    test.skip('pagination works correctly', async () => {
        const moreUsers = [...users, ...users];
        render(<UserEmployeeListMittel fetchedUsers={moreUsers} />);
        await userEvent.click(screen.getByLabelText('Go to next page'));
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('removing a user updates the list and shows snackbar', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        await userEvent.click(screen.getByLabelText('delete-John Doe'));
        expect(await screen.findByText('User removed successfully!')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).toBeNull();
    });

    test('clicking edit button navigates to user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        await userEvent.click(screen.getByLabelText('edit-John Doe'));
        expect(mockPush).toHaveBeenCalledWith('/edit/John Doe');
    });

    test('shows alert when no users match the search criteria', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('shows alert when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('snackbar closes automatically after duration', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        await userEvent.click(screen.getByLabelText('delete-John Doe'));
        await waitFor(() => expect(screen.queryByText('User removed successfully!')).toBeNull(), { timeout: 3000 });
    });
});
