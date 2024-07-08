import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { User, USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promises
- mock of wrong query instead of fetch

- vairablen - 7
- enum
- unused import

- 10 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -45
Testumfang: 74,7
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListSchwer', () => {
    const users: UserNoPw[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: users,
            isError: false,
            refetch: jest.fn(),
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    test('renders user list', () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
    });

    test('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');

        expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
        expect(screen.queryByLabelText('Jane Smith')).not.toBeInTheDocument();
    });

    test('sorts users by email', async () => {
        render(<UserEmployeeListSchwer />);

        const sortByEmail = screen.getByLabelText('Email');
        await userEvent.click(sortByEmail);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Jane Smith');
        expect(userItems[1]).toHaveTextContent('John Doe');
    });

    test('routes to user edit page', async () => {
        const routerPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: routerPush,
        });

        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(routerPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    test.skip('removes user from list', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(users.slice(1)),
                status: 200,
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(await screen.findByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
    });

    test('displays error alert when data fetching fails', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: undefined,
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    test('displays info alert when no users match the search term', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistent user');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test.skip('handles role filter change', async () => {
        render(<UserEmployeeListSchwer />);

        const roleFilter = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleFilter, 'EMPLOYEE');

        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
    });

    test('displays pagination controls', () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    });

    test.skip('displays no users created alert when fetchedUsers is empty', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    test('shows snackbar with message when user deletion fails', async () => {
        global.fetch = jest.fn(() =>
            Promise.reject({
                status: 500,
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(await screen.findByText('Deletion of user failed!')).toBeInTheDocument();
    });

    test.skip('hides snackbar after autoHideDuration', async () => {
        jest.useFakeTimers();
        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(await screen.findByText('Deletion of user failed!')).toBeInTheDocument();

        jest.advanceTimersByTime(1000);

        expect(screen.queryByText('Deletion of user failed!')).not.toBeInTheDocument();
    });
});
