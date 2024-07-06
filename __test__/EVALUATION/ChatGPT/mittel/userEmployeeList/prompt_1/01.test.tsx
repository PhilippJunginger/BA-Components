import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- fireEvent
- promises
- setup

- vairablen

- 7 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -30
CleanCode: -5
Testumfang: 65
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const users = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    test.skip('renders component with users', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();

        users.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    test('displays alert when no users match search', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const searchInput = screen.getByLabelText('Search Users');

        fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays alert when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test.skip('filters users by role', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const filterSelect = screen.getByLabelText('Filter by Role');

        fireEvent.change(filterSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByText(users[0].name)).toBeInTheDocument();
        expect(screen.queryByText(users[1].name)).not.toBeInTheDocument();
    });

    test.skip('sorts users by email', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const emailRadio = screen.getByLabelText('Email');

        fireEvent.click(emailRadio);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent(users[1].name);
        expect(userItems[1]).toHaveTextContent(users[0].name);
    });

    test('navigates to user edit page on edit button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const editButton = screen.getByLabelText(`edit-${users[0].name}`);

        await userEvent.click(editButton);

        expect(mockPush).toHaveBeenCalledWith(`/edit/${users[0].name}`);
    });

    test('removes user from list and shows snackbar on delete', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const deleteButton = screen.getByLabelText(`delete-${users[0].name}`);

        await userEvent.click(deleteButton);

        expect(screen.queryByText(users[0].name)).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    test.skip('pagination works correctly', () => {
        const manyUsers = Array.from({ length: 12 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));
        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);

        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(screen.getByText('User 5')).toBeInTheDocument();
        expect(screen.queryByText('User 6')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /2/i }));

        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        expect(screen.getByText('User 6')).toBeInTheDocument();
        expect(screen.getByText('User 10')).toBeInTheDocument();
    });
});
