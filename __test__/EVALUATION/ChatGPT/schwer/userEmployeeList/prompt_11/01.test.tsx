import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- waitFOr assertions
- promises
- setup

- unused import
- vairablen - 6
- unnnecessary waitFor - 8
- enum

- 7 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -80
Tetumfang: 53,95
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const mockRouterPush = jest.fn();
const mockRefetch = jest.fn();

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
        (useQuery as jest.Mock).mockReturnValue({
            data: [
                { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
                { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
            ],
            isError: false,
            refetch: mockRefetch,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders user list with fetched users', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('displays error message when fetching users fails', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: null,
            isError: true,
            refetch: mockRefetch,
        });

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('sorts users by name and email', async () => {
        render(<UserEmployeeListSchwer />);

        const sortByEmail = screen.getByLabelText('Email');
        await userEvent.click(sortByEmail);

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[0]).toHaveTextContent('Jane Smith');
            expect(userItems[1]).toHaveTextContent('John Doe');
        });
    });

    test('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);

        const roleFilter = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleFilter);
        await userEvent.click(screen.getByText(USER_ROLE.EMPLOYEE));

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('handles user deletion', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    test('handles user edit navigation', async () => {
        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    test.skip('handles pagination', async () => {
        render(<UserEmployeeListSchwer />);

        const nextPageButton = screen.getByRole('button', { name: /next/i });
        await userEvent.click(nextPageButton);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /2/i })).toHaveAttribute('aria-current', 'true');
        });
    });
});
