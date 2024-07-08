import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- waitFOr assertions

- vairablen - 6
- unnecessary waitFor 4
- enum
- typeerror

- 5 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -60
Tetumfang: 37,35
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const mockRouterPush = jest.fn();

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
];

describe('UserEmployeeListSchwer Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        useRouter.mockReturnValue({ push: mockRouterPush });
        useQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });
    });

    it('should display the list of users', () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(searchInput).toHaveValue('Jane');
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListSchwer />);

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        expect(emailRadio).toBeChecked();
        await waitFor(() => {
            const userList = screen.getAllByRole('listitem');
            expect(userList[0]).toHaveTextContent('jane@example.com');
            expect(userList[1]).toHaveTextContent('john@example.com');
        });
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        const employeeOption = screen.getByText('EMPLOYEE');
        await user.click(employeeOption);

        expect(roleSelect).toHaveTextContent('EMPLOYEE');
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('should navigate to user edit page on edit button click', async () => {
        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(mockRouterPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('should show snackbar message on deletion failure', async () => {
        useQuery.mockReturnValueOnce({
            data: mockUsers,
            isError: false,
            refetch: jest.fn().mockRejectedValueOnce(new Error('Deletion of user failed!')),
        });
        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });
});
