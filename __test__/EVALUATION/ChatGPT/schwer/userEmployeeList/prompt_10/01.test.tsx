import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- setup
- waitFor

- enum
- unnecessary waitFor - 4
- vairablen - 5

- 6 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -30
CleanCode: -50
Tetumfang: 45,65
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

const mockRefetch = jest.fn();
const mockPush = jest.fn();

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it.skip('should render user list with fetched users', async () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();

        const userItems = screen.getAllByRole('listitem');
        expect(userItems).toHaveLength(2);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it.skip('should filter users by search term', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems).toHaveLength(1);
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListSchwer />);

        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            const firstUser = within(userItems[0]).getByText('Jane Smith');
            const secondUser = within(userItems[1]).getByText('John Doe');
            expect(firstUser).toBeInTheDocument();
            expect(secondUser).toBeInTheDocument();
        });
    });

    it.skip('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        const adminOption = screen.getByRole('option', { name: 'ADMIN' });
        await userEvent.click(adminOption);

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems).toHaveLength(1);
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('should navigate to user edit page on edit button click', async () => {
        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it.skip('should show snackbar message on delete failure', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: mockUsers,
            isError: true,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it.skip('should paginate users correctly', async () => {
        const moreUsers = Array.from({ length: 12 }, (_, i) => ({
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: 'EMPLOYEE',
        }));

        (useQuery as jest.Mock).mockReturnValueOnce({
            data: moreUsers,
            isError: false,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems).toHaveLength(5);
            expect(screen.getByText('User 1')).toBeInTheDocument();
        });

        const nextPageButton = screen.getByRole('button', { name: /next/i });
        await userEvent.click(nextPageButton);

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems).toHaveLength(5);
            expect(screen.getByText('User 6')).toBeInTheDocument();
        });
    });
});
