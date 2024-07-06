import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- fireEvent
- promises
- setup

- unused import
- vairablen - 5

- 7 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -25
Testumfang: 60
 */

// Mock the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();

describe('UserEmployeeListMittel', () => {
    const fetchedUsers: UserNoPw[] = [
        { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
        { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
        // Add more users as needed for testing
    ];

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders UserEmployeeListMittel component', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    test.skip('displays correct number of users based on pagination', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        expect(screen.getAllByRole('listitem')).toHaveLength(Math.min(5, fetchedUsers.length));
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        await userEvent.type(screen.getByLabelText('Search Users'), 'alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('sorts users based on selected sort option', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        await userEvent.click(screen.getByLabelText('Email'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('alice@example.com');
        expect(userItems[1]).toHaveTextContent('bob@example.com');
    });

    test('filters users based on selected role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        await userEvent.click(screen.getByLabelText('Filter by Role'));
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('handles user removal and displays snackbar', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        await userEvent.click(screen.getByLabelText('delete-Alice'));
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test('navigates to user edit page on edit button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        await userEvent.click(screen.getByLabelText('edit-Alice'));
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    test('displays no users matching current search alert when no users match', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        await userEvent.type(screen.getByLabelText('Search Users'), 'nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays no users available alert when fetchedUsers is empty', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
