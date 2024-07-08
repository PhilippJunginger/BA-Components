import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query

- vairablen - 7
- unnecessary waitFor 2
- enum

- 6 von 12 notwendigen Testfälen erreicht + 1 Redundanz

Best-Practices: -20
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
    { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
];

describe('UserEmployeeListSchwer Component', () => {
    const user = userEvent.setup();

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

    it('should render the component and display users', async () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListSchwer />);

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('Jane Smith');
        expect(userList[1]).toHaveTextContent('John Doe');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: 'EMPLOYEE' }));

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it.skip('should handle pagination', async () => {
        render(<UserEmployeeListSchwer />);

        const nextPageButton = screen.getByLabelText('Go to next page');
        await user.click(nextPageButton);

        // Assuming there are more users to paginate through
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    it('should show snackbar message on deletion failure', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn().mockRejectedValue(new Error('Deletion failed')),
        });

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    it('should navigate to edit user page', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });

        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-Jane Smith');
        await user.click(editButton);

        expect(pushMock).toHaveBeenCalledWith('/edit/JaneSmith');
    });
});
