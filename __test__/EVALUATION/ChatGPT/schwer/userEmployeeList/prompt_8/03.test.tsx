import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query

- enum
- unused import
- vairablen - 7
- unnecessary waitFor

- 7 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -50
Tetumfang: 53,95
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
    const refetch = jest.fn();

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch,
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('should display the list of users', async () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
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

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Jane Smith');
        expect(userItems[1]).toHaveTextContent('John Doe');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: 'ADMIN' }));

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it.skip('should handle user deletion', async () => {
        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(refetch).toHaveBeenCalled();
        });
    });

    it('should navigate to user edit page', async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(push).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('should display snackbar on deletion failure', async () => {
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

    it.skip('should handle pagination', async () => {
        render(<UserEmployeeListSchwer />);

        const nextPageButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextPageButton);

        expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'true');
    });
});
