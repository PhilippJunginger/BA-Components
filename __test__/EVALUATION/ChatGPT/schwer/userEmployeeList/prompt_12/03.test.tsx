import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- waitFOr assertions

- useQuery not in beforeEach
- vairablen - 5
- unnnecessary await findBy - 4
- enum

- 8 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -55
Tetumfang: 62,25
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListSchwer Component', () => {
    const user = userEvent.setup();
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component and display fetched users', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [
                { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
            ],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(await screen.findByText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle search input change', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [
                { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
            ],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(searchInput).toHaveValue('Jane');
        expect(await screen.findByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should handle sort by selection', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [
                { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
            ],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        const sortByEmail = screen.getByLabelText('Email');
        await user.click(sortByEmail);

        expect(sortByEmail).toBeChecked();
    });

    it.skip('should handle role filter change', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [
                { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
            ],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        const roleFilter = screen.getByLabelText('Filter by Role');
        await user.click(roleFilter);
        await user.click(screen.getByRole('option', { name: 'ADMIN' }));

        expect(roleFilter).toHaveValue('ADMIN');
        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should handle pagination change', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: Array.from({ length: 10 }, (_, i) => ({
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                role: 'EMPLOYEE',
            })),
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        const nextPageButton = screen.getByLabelText('Go to page 2');
        await user.click(nextPageButton);

        expect(await screen.findByText('User 6')).toBeInTheDocument();
    });

    it.skip('should handle user deletion', async () => {
        const refetchMock = jest.fn().mockResolvedValue({
            data: [{ name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' }],
        });

        (useQuery as jest.Mock).mockReturnValue({
            data: [
                { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
            ],
            isError: false,
            refetch: refetchMock,
        });

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(refetchMock).toHaveBeenCalled();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('should handle user edit navigation', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [
                { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
            ],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('should display error alert when fetching users fails', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(await screen.findByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('should display no users alert when no users are fetched', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(await screen.findByText('No Users created')).toBeInTheDocument();
    });
});
