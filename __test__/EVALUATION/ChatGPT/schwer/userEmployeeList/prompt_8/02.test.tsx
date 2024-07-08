import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query

- enum
- vairablen - 5
- unnecessary waitFor

- 6 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -35
Tetumfang: 45,65
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

    it('should render the component and display users', async () => {
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
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should show entered value in search input', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
    });

    it('should change value of sort by radio buttons', async () => {
        render(<UserEmployeeListSchwer />);

        const sortByEmail = screen.getByLabelText('Email');
        await user.click(sortByEmail);
        expect(sortByEmail).toBeChecked();
    });

    it.skip('should change value of role filter select', async () => {
        render(<UserEmployeeListSchwer />);

        const roleFilter = screen.getByLabelText('Filter by Role');
        await user.click(roleFilter);
        await user.click(screen.getByRole('option', { name: 'ADMIN' }));
        expect(roleFilter).toHaveValue('ADMIN');
    });

    it('should handle user deletion and show snackbar on failure', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [{ name: 'John Doe', email: 'john@example.com', role: 'ADMIN' }],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    it('should navigate to edit user page on edit button click', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [{ name: 'John Doe', email: 'john@example.com', role: 'ADMIN' }],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('should handle pagination', async () => {
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

        const nextPageButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextPageButton);

        await waitFor(() => {
            expect(screen.getByText('User 6')).toBeInTheDocument();
        });
    });
});
