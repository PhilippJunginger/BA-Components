import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- setup
- mock of query instead of fetch

- vairablen - 4
- typeerror

- 9 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -25
Testumfang: 70,55
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListSchwer Component', () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: mockRefetch,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should handle search input change', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
    });

    it('should handle sort by selection change', async () => {
        render(<UserEmployeeListSchwer />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        expect(emailRadio).toBeChecked();
        expect(nameRadio).not.toBeChecked();
    });

    it('should handle role filter change', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        const adminOption = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await userEvent.click(adminOption);
        expect(adminOption.selected).toBe(true);
    });

    it.skip('should handle page change', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(pagination);
        expect(pagination).toHaveAttribute('aria-current', 'true');
    });

    it.skip('should display error alert when fetching users fails', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: true,
            refetch: mockRefetch,
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('should display no users alert when there are no users', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: false,
            refetch: mockRefetch,
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    it.skip('should handle user deletion', async () => {
        const mockUsers = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE }];
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
    });

    it.skip('should handle user edit routing', async () => {
        const mockUsers = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE }];
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe'));
    });

    it.skip('should display snackbar message on user deletion failure', async () => {
        const mockUsers = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE }];
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        await screen.findByText('Deletion of user failed!');
    });
});
