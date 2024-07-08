import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promises
- mock of wrong query instead of fetch
- fireEvent
- waitFor

- vairablen - 6
- typeerror
- unnecessary waitFor - 9

- 8 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -50
CleanCode: -80
Tetumfang: 58,1
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
    let refetch;

    beforeEach(() => {
        refetch = jest.fn().mockResolvedValue({ data: mockUsers });
        useQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch,
        });
        useRouter.mockReturnValue({ push: jest.fn() });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders component and displays user list', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('User List')).toBeInTheDocument();
        });

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
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

    test('sorts users based on selected criteria', async () => {
        render(<UserEmployeeListSchwer />);

        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);

        await waitFor(() => {
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });

        fireEvent.click(nameRadio);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    test.skip('filters users based on role selection', async () => {
        render(<UserEmployeeListSchwer />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, 'EMPLOYEE');

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test.skip('handles user deletion with success', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 200, json: jest.fn().mockResolvedValue({}) });
        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(refetch).toHaveBeenCalled();
        });

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('handles user deletion with error', async () => {
        global.fetch = jest.fn().mockRejectedValue({});
        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    test('routes to user edit page on edit button click', async () => {
        const push = jest.fn();
        useRouter.mockReturnValue({ push });

        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    test('displays no users matching search message', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistingUser');

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    test('displays no users created message', async () => {
        useQuery.mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });

    test('displays error message on data fetch error', async () => {
        useQuery.mockReturnValue({
            data: undefined,
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });
});
