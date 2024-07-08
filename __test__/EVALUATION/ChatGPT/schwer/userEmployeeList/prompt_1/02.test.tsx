import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promises
- mock of wrong query instead of fetch
- waitFor assertions

- unused import - 1
- vairablen - 6
- unnecessary waitFor - 5
- typeerror - 4

- 7 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -80
Testumfang: 49,8
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

const mockUsers = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        mockUseRouter.mockReturnValue({ push: jest.fn() });
        mockUseQuery.mockReturnValue({ data: mockUsers, isError: false, refetch: jest.fn() });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('displays users correctly', async () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });

    it('filters users based on search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');
        await waitFor(() => {
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    it('sorts users by name or email', async () => {
        render(<UserEmployeeListSchwer />);
        const sortByEmail = screen.getByLabelText('Email');
        await userEvent.click(sortByEmail);
        await waitFor(() => {
            const userList = screen.getAllByRole('listitem');
            expect(userList[0]).toHaveTextContent('jane.smith@example.com');
            expect(userList[1]).toHaveTextContent('john.doe@example.com');
        });
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const filterRoleSelect = screen.getByLabelText('Filter by Role');
        fireEvent.change(filterRoleSelect, { target: { value: USER_ROLE.EMPLOYEE } });
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it.skip('handles user deletion correctly', async () => {
        const mockRefetch = jest.fn();
        mockUseQuery.mockReturnValueOnce({ data: mockUsers, isError: false, refetch: mockRefetch });
        render(<UserEmployeeListSchwer />);
        const deleteUserButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteUserButton);
        await waitFor(() => {
            expect(mockRefetch).toHaveBeenCalled();
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    it('navigates to user edit page on edit button click', async () => {
        const mockPush = jest.fn();
        mockUseRouter.mockReturnValue({ push: mockPush });
        render(<UserEmployeeListSchwer />);
        const editUserButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editUserButton);
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    it('displays error alert when fetching users fails', async () => {
        mockUseQuery.mockReturnValueOnce({ data: null, isError: true });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it.skip('displays no users message when no users are found', async () => {
        mockUseQuery.mockReturnValueOnce({ data: [], isError: false });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });
});
