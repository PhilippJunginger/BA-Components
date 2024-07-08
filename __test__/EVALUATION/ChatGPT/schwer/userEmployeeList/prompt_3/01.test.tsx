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
- getByText.not

- vairablen - 4
- unnecessary waitFOr
- unused import

- 9 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -30
Testumfang: 66,4
 */

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

describe('UserEmployeeListSchwer', () => {
    const mockPush = jest.fn();
    const refetch = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch,
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

    test('handles search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        expect(searchInput).toHaveValue('John');
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
        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);
        expect(filterSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test.skip('handles page change', async () => {
        render(<UserEmployeeListSchwer />);
        const nextPageButton = screen.getByLabelText('Go to next page');
        await userEvent.click(nextPageButton);
        expect(screen.getByLabelText('Go to page 2')).toBeInTheDocument();
    });

    test.skip('handles user deletion', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({}),
        });

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => expect(refetch).toHaveBeenCalled());
        expect(screen.getByText('Deletion of user failed!')).not.toBeInTheDocument();
    });

    test('handles user edit navigation', async () => {
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe'));
    });

    test('displays error message on fetch error', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: null,
            isError: true,
            refetch,
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    test.skip('displays no users message when no users are fetched', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: false,
            refetch,
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    test('displays no matching users message when search yields no results', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
