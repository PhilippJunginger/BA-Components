import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promises
- mock of wrong query instead of fetch

- vairablen - 4
- unnecessary waitFOr
- unused import

- 9 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -30
Testumfang: 66,4
 */

// Mocking external dependencies
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListSchwer Component', () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders component correctly', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    test('displays users correctly', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    test('handles search input correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        expect(searchInput).toHaveValue('John');
    });

    test('handles sort by selection correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const sortByEmail = screen.getByLabelText('Email');
        await userEvent.click(sortByEmail);
        expect(sortByEmail).toBeChecked();
    });

    test('handles role filter selection correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const filterByRole = screen.getByLabelText('Filter by Role');
        await userEvent.click(filterByRole);
        const adminOption = screen.getByText(USER_ROLE.ADMIN);
        await userEvent.click(adminOption);
        expect(screen.getByText(USER_ROLE.ADMIN)).toBeInTheDocument();
    });

    test.skip('handles pagination correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const nextPageButton = screen.getByLabelText('Go to next page');
        await userEvent.click(nextPageButton);
        expect(screen.getByLabelText('Go to page 2')).toBeInTheDocument();
    });

    test('handles user deletion correctly', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({}),
        });

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    test('handles user edit routing correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    test('displays error message when fetching users fails', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: null,
            isError: true,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    test.skip('displays no users message when no users are fetched', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: false,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    test('displays no matching users message when search term does not match any user', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
