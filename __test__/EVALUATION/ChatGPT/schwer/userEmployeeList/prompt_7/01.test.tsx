import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- userEvent
- fireEvent
- waitFor
- mocking of query

- unused import
- vairablen - 6
- typecast for refetch instead of initialising with jest.fn()

- 9 von 12 notwendigen Testfälen erreicht


Best-Practices: -50
CleanCode: -40
Tetumfang: 74,7
 */

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
    let refetch: jest.Mock;

    beforeEach(() => {
        refetch = jest.fn();
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch,
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the user list and allows searching', async () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Search Users'), { target: { value: 'Alice' } });

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        });
    });

    it('allows sorting by name and email', async () => {
        render(<UserEmployeeListSchwer />);

        fireEvent.click(screen.getByLabelText('Email'));

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[0]).toHaveTextContent('Alice');
            expect(userItems[1]).toHaveTextContent('Bob');
        });
    });

    it.skip('allows filtering by role', async () => {
        render(<UserEmployeeListSchwer />);

        fireEvent.mouseDown(screen.getByLabelText('Filter by Role'));
        fireEvent.click(screen.getByText('Admin'));

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        });
    });

    it('handles user deletion', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            status: 200,
            json: jest.fn().mockResolvedValueOnce({}),
        });

        render(<UserEmployeeListSchwer />);

        fireEvent.click(screen.getByLabelText('delete-Alice'));

        await waitFor(() => {
            expect(refetch).toHaveBeenCalled();
        });
    });

    it('handles navigation to user edit page', async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        render(<UserEmployeeListSchwer />);

        fireEvent.click(screen.getByLabelText('edit-Alice'));

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/edit/Alice');
        });
    });

    it('displays an error message when fetching users fails', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: null,
            isError: true,
            refetch,
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('displays a message when no users match the search criteria', async () => {
        render(<UserEmployeeListSchwer />);

        fireEvent.change(screen.getByLabelText('Search Users'), { target: { value: 'NonExistentUser' } });

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    it.skip('displays a message when no users are created', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: false,
            refetch,
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    it('displays a snackbar message on user deletion failure', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            status: 400,
            json: jest.fn().mockResolvedValueOnce({}),
        });

        render(<UserEmployeeListSchwer />);

        fireEvent.click(screen.getByLabelText('delete-Alice'));

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });
});
