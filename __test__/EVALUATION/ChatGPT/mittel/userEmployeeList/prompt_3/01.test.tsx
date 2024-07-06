import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- setup

- unused import
- vairablen - 4
- unnecessary waitFor - 2

- 8 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -35
Testumfang: 70
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders component with initial state', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
        expect(screen.getByLabelText('user-list')).toBeInTheDocument();
    });

    test('displays users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        mockUsers.forEach((user) => {
            expect(screen.getByLabelText(user.name)).toBeInTheDocument();
        });
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'Alice');
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie')).not.toBeInTheDocument();
    });

    test.skip('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('Email'));
        const sortedUsers = mockUsers.sort((a, b) => a.email.localeCompare(b.email));
        sortedUsers.forEach((user, index) => {
            expect(screen.getAllByLabelText(user.name)[index]).toBeInTheDocument();
        });
    });

    test.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.selectOptions(screen.getByLabelText('Filter by Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie')).not.toBeInTheDocument();
    });

    test('removes user from list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('delete-Alice'));
        await waitFor(() => expect(screen.queryByLabelText('Alice')).not.toBeInTheDocument());
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test('navigates to user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('edit-Alice'));
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/edit/Alice'));
    });

    test.skip('handles pagination', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('Go to next page'));
        expect(screen.getByLabelText('user-list')).toBeInTheDocument();
    });

    test('displays no users available message', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('displays no users matching search message', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
