import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- setup
- mock of wrong query instead of fetch

- vairablen - 6
- unnecessary waitFOr - 4
- unused import

- 9 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -55
Testumfang: 70,55
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListSchwer Component', () => {
    const mockUseQuery = useQuery as jest.Mock;
    const mockUseRouter = useRouter as jest.Mock;
    const mockPush = jest.fn();

    beforeEach(() => {
        mockUseRouter.mockReturnValue({ push: mockPush });
        mockUseQuery.mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });
    });

    it('should render the component', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it.skip('should display an error alert when there is an error fetching users', () => {
        mockUseQuery.mockReturnValueOnce({
            data: [],
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('should display no users created alert when there are no users', () => {
        mockUseQuery.mockReturnValueOnce({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    it('should update search term state on input change', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
    });

    it('should update sort by state on radio button change', async () => {
        render(<UserEmployeeListSchwer />);
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        expect(emailRadio).toBeChecked();
    });

    it.skip('should update filter role state on select change', async () => {
        render(<UserEmployeeListSchwer />);
        const select = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(select, 'ADMIN');
        expect(select).toHaveValue('ADMIN');
    });

    it.skip('should paginate users', async () => {
        mockUseQuery.mockReturnValueOnce({
            data: [
                { name: 'User1', email: 'user1@example.com', role: USER_ROLE.ADMIN },
                { name: 'User2', email: 'user2@example.com', role: USER_ROLE.EMPLOYEE },
                { name: 'User3', email: 'user3@example.com', role: USER_ROLE.EMPLOYEE },
                { name: 'User4', email: 'user4@example.com', role: USER_ROLE.ADMIN },
                { name: 'User5', email: 'user5@example.com', role: USER_ROLE.EMPLOYEE },
                { name: 'User6', email: 'user6@example.com', role: USER_ROLE.ADMIN },
            ],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User1')).toBeInTheDocument();
        expect(screen.queryByText('User6')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: /next/i });
        await userEvent.click(nextPageButton);

        await waitFor(() => {
            expect(screen.getByText('User6')).toBeInTheDocument();
        });
    });

    it.skip('should handle user deletion', async () => {
        const refetchMock = jest.fn().mockResolvedValue({ data: [] });
        mockUseQuery.mockReturnValueOnce({
            data: [{ name: 'User1', email: 'user1@example.com', role: USER_ROLE.ADMIN }],
            isError: false,
            refetch: refetchMock,
        });

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-User1');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(refetchMock).toHaveBeenCalled();
        });
    });

    it.skip('should handle routing to user edit page', async () => {
        mockUseQuery.mockReturnValueOnce({
            data: [{ name: 'User1', email: 'user1@example.com', role: USER_ROLE.ADMIN }],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-User1');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/User1');
        });
    });

    it.skip('should display snackbar message on deletion failure', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 400,
            json: jest.fn().mockResolvedValue({}),
        });

        mockUseQuery.mockReturnValueOnce({
            data: [{ name: 'User1', email: 'user1@example.com', role: USER_ROLE.ADMIN }],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-User1');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });
});
