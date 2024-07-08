import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- promises
- setup
- waitFor

- unnecessary waitFor - 7
- vairablen - 7
- typeerror 3

- 7 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -85
Tetumfang: 53,95
 */

// Mock the useQuery and useRouter hooks
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        useQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });
        useRouter.mockReturnValue({ push: jest.fn() });
    });

    it('renders the component correctly', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByText('Sort by')).toBeInTheDocument();
        expect(screen.getByText('Filter by Role')).toBeInTheDocument();
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'Alice');
        await waitFor(() => {
            expect(screen.queryByText('Alice')).toBeInTheDocument();
            expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        });
    });

    it('sorts users based on selected sort option', async () => {
        render(<UserEmployeeListSchwer />);
        await userEvent.click(screen.getByLabelText('Email'));
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('Alice');
            expect(listItems[1]).toHaveTextContent('Bob');
        });
    });

    it('filters users based on role', async () => {
        render(<UserEmployeeListSchwer />);
        await userEvent.click(screen.getByLabelText('Filter by Role'));
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));
        await waitFor(() => {
            expect(screen.queryByText('Alice')).toBeInTheDocument();
            expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        });
    });

    it.skip('handles pagination correctly', async () => {
        render(<UserEmployeeListSchwer />);
        await userEvent.click(screen.getByLabelText('Next page'));
        await waitFor(() => {
            expect(screen.queryByText('Alice')).not.toBeInTheDocument();
            expect(screen.queryByText('Bob')).toBeInTheDocument();
        });
    });

    it('displays error alert when query fails', async () => {
        useQuery.mockReturnValueOnce({
            data: null,
            isError: true,
            refetch: jest.fn(),
        });
        render(<UserEmployeeListSchwer />);
        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it('handles user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        await userEvent.click(screen.getByLabelText('delete-Alice'));
        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    it.skip('navigates to user edit page on edit button click', async () => {
        const mockPush = jest.fn();
        useRouter.mockReturnValueOnce({ push: mockPush });
        render(<UserEmployeeListSchwer />);
        await userEvent.click(screen.getByLabelText('edit-Alice'));
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
        });
    });
});
