import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promises
- mock of wrong query instead of fetch

- vairablen - 5
- unnecessary waitFOr
- unused import

- 10 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -35
Testumfang: 74,7
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListSchwer', () => {
    const refetchMock = jest.fn();
    const pushMock = jest.fn();

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: refetchMock,
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    test('displays users correctly', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    test('handles search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
    });

    test('handles sort by selection', async () => {
        render(<UserEmployeeListSchwer />);
        const sortByEmail = screen.getByLabelText('Email');
        await userEvent.click(sortByEmail);
        expect(sortByEmail).toBeChecked();
    });

    test.skip('handles role filter change', async () => {
        render(<UserEmployeeListSchwer />);
        const filterSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(filterSelect, USER_ROLE.EMPLOYEE);
        expect(filterSelect).toHaveValue(USER_ROLE.EMPLOYEE);
    });

    test.skip('handles pagination', async () => {
        render(<UserEmployeeListSchwer />);
        const nextPageButton = screen.getByLabelText('Go to next page');
        await userEvent.click(nextPageButton);
        expect(screen.getByLabelText('Go to page 2')).toBeInTheDocument();
    });

    test('handles user deletion', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({}),
        });

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(refetchMock).toHaveBeenCalled();
        });
    });

    test('handles user edit routing', async () => {
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    test('displays error message on user deletion failure', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 400,
            json: jest.fn().mockResolvedValue({}),
        });

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    test('displays error alert when fetching users fails', () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: null,
            isError: true,
            refetch: refetchMock,
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    test('displays no users created message', () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: refetchMock,
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    test('displays no matching users message', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
