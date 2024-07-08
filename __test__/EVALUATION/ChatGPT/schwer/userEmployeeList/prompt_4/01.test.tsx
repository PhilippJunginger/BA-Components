import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- waitFor assertions
- mock of wrong query instead of fetch

- unused import
- vairablen - 7

- 10 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -40
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

describe('UserEmployeeListSchwer Component', () => {
    const user = userEvent.setup();
    const refetchMock = jest.fn();

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: refetchMock,
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('should render the component', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display users', () => {
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

    it.skip('should handle user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        await waitFor(() => expect(refetchMock).toHaveBeenCalled());
    });

    it('should handle user edit routing', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-Jane Smith');
        await user.click(editButton);
        expect(pushMock).toHaveBeenCalledWith('/edit/JaneSmith');
    });

    it('should display error message on fetch error', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: null,
            isError: true,
            refetch: refetchMock,
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it.skip('should display no users created message', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: false,
            refetch: refetchMock,
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    it('should display no matching users message', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it.skip('should handle pagination', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('button', { name: '2' });
        await user.click(pagination);
        expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'true');
    });

    it('should display snackbar message on deletion failure', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: mockUsers,
            isError: false,
            refetch: refetchMock,
        });
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        await screen.findByText('Deletion of user failed!');
    });
});
