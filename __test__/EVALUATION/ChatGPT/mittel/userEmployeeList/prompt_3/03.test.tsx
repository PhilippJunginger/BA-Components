import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- setup

- unused import - 2
- vairablen - 6

- 8 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -40
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

    test.skip('renders component with initial props', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    test('displays users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.getByLabelText('Bob')).toBeInTheDocument();
        expect(screen.getByLabelText('Charlie')).toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'Alice');
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie')).not.toBeInTheDocument();
    });

    test('sorts users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('Email'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice');
        expect(userItems[1]).toHaveTextContent('Bob');
        expect(userItems[2]).toHaveTextContent('Charlie');
    });

    test.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.selectOptions(screen.getByLabelText('Filter by Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie')).not.toBeInTheDocument();
    });

    test('removes user from list and shows snackbar', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('delete-Alice'));
        expect(screen.queryByLabelText('Alice')).not.toBeInTheDocument();
        await screen.findByText('User removed successfully!');
    });

    test('navigates to user edit page on edit button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('edit-Alice'));
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    test('displays no users available message when fetchedUsers is empty', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('displays no matching users message when search term does not match any user', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test.skip('paginates users correctly', async () => {
        const manyUsers = Array.from({ length: 12 }, (_, i) => ({
            name: `User${i}`,
            email: `user${i}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));
        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        await userEvent.click(screen.getByLabelText('Go to page 2'));
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        await userEvent.click(screen.getByLabelText('Go to page 3'));
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
});
