import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- promises
- setup
- waitFor

- unused import
- enum
- unnecessary waitFor - 6
- vairablen - 6

- 8 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -70
Tetumfang: 58,1
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'EMPLOYEE' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN' },
];

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });

        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    test('renders User List heading', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    test('renders user list items', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('sorts users based on selected criteria', async () => {
        render(<UserEmployeeListSchwer />);
        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);
        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[0]).toHaveTextContent('Jane Smith');
            expect(userItems[1]).toHaveTextContent('John Doe');
        });
    });

    test.skip('filters users based on selected role', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, 'ADMIN');
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test.skip('handles page change', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('button', { name: /2/i });
        await userEvent.click(pagination);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /2/i })).toHaveAttribute('aria-current', 'true');
        });
    });

    test('handles edit user action', async () => {
        const router = useRouter();
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);
        await waitFor(() => {
            expect(router.push).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    test.skip('handles delete user action', async () => {
        const refetchMock = jest.fn().mockResolvedValue({ data: mockUsers });
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: refetchMock,
        });
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(refetchMock).toHaveBeenCalled();
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    test('displays error message on fetch error', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: null,
            isError: true,
            refetch: jest.fn(),
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    test('displays no users message when no users are available', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });
});
