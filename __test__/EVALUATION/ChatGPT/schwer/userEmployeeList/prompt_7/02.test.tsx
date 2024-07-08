import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- promise
- setup
- waitFor
- node access
- mocking of query

- unused import
- vairablen - 7
- typecast for refetch instead of initialising with jest.fn()

- 10 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -50
CleanCode: -45
Tetumfang: 78,85
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

    test('renders the user list', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByText('Sort by')).toBeInTheDocument();
        expect(screen.getByText('Filter by Role')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('sorts users by email', async () => {
        render(<UserEmployeeListSchwer />);
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        await waitFor(() => {
            const users = screen.getAllByRole('listitem');
            expect(users[0]).toHaveTextContent('Jane Smith');
            expect(users[1]).toHaveTextContent('John Doe');
        });
    });

    test.skip('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await waitFor(() => {
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    test.skip('handles user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(refetch).toHaveBeenCalled();
        });
    });

    test('handles user edit routing', async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);
        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    test('displays error message on fetch error', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: null,
            isError: true,
            refetch,
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    test('displays no users message when no users are fetched', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch,
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    test('displays no matching users message when search term does not match any user', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');
        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    test.skip('handles pagination', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('navigation');
        await userEvent.click(pagination.querySelector('button[aria-label="Go to page 2"]')!);
        await waitFor(() => {
            expect(screen.getByRole('button', { current: true })).toHaveTextContent('2');
        });
    });

    test('displays snackbar message on user deletion failure', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn().mockRejectedValue(new Error('Deletion of user failed!')),
        });
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });
});
