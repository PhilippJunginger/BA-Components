import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promises
- mock of wrong query instead of fetch

- unused import - 1
- vairablen - 8
- unnecessary waitFor
- typeerror - 4
- enum

- 8 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -75
Testumfang: 58,1
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers = [
    { name: 'Alice', email: 'alice@example.com', role: 'ADMIN' },
    { name: 'Bob', email: 'bob@example.com', role: 'EMPLOYEE' },
];

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        useQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });

        useRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    test('renders the component', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    test('displays users fetched from API', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    test('handles search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(searchInput).toHaveValue('Alice');
    });

    test('filters users based on search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('sorts users by email', async () => {
        render(<UserEmployeeListSchwer />);
        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);
        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('alice@example.com');
        expect(userList[1]).toHaveTextContent('bob@example.com');
    });

    test.skip('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, 'ADMIN');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('navigates to user edit page on edit button click', async () => {
        const { push } = useRouter();
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-Alice');
        await userEvent.click(editButton);
        expect(push).toHaveBeenCalledWith('/edit/Alice');
    });

    test('handles user deletion', async () => {
        const refetch = jest.fn();
        useQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: refetch,
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        );

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);

        await waitFor(() => expect(refetch).toHaveBeenCalled());
    });

    test('displays error message on user deletion failure', async () => {
        useQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: () => Promise.resolve({}),
            }),
        );

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);

        await screen.findByText('Deletion of user failed!');
    });

    test('displays error alert when API call fails', () => {
        useQuery.mockReturnValue({
            data: null,
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });
});
