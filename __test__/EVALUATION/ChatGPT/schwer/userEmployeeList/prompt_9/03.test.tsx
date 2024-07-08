import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- promises
- setup
- waitFor

- unnecessary waitFor - 7
- vairablen - 7

- 6 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -70
Tetumfang: 45,65
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
    const mockRefetch = jest.fn();

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: mockRefetch,
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders the user list and search field', async () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeChecked();
        expect(screen.getByLabelText('All')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />);

        await userEvent.type(screen.getByLabelText('Search Users'), 'John');

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    test('sorts users based on selected criteria', async () => {
        render(<UserEmployeeListSchwer />);

        await userEvent.click(screen.getByLabelText('Email'));

        await waitFor(() => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[0]).toHaveTextContent('Jane Smith');
            expect(userItems[1]).toHaveTextContent('John Doe');
        });
    });

    test('filters users based on selected role', async () => {
        render(<UserEmployeeListSchwer />);

        await userEvent.click(screen.getByLabelText('Filter by Role'));
        await userEvent.click(screen.getByText(USER_ROLE.EMPLOYEE));

        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    test('navigates to edit user page on edit button click', async () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        render(<UserEmployeeListSchwer />);

        await userEvent.click(screen.getByLabelText('edit-John Doe'));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    test('shows error message on user deletion failure', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);

        await userEvent.click(screen.getByLabelText('delete-John Doe'));

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    test.skip('paginates users correctly', async () => {
        render(<UserEmployeeListSchwer />);

        const pagination = screen.getByRole('button', { name: /2/i });
        await userEvent.click(pagination);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });
});
