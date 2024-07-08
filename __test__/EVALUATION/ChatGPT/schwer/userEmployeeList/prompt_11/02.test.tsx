import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- promises
- waitFor prefer findBy
- setup

- unused import
- vairablen - 7
- enum

- 6 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -45
Tetumfang: 45,65
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
];

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    test('renders the component', async () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        await screen.findByText('John Doe');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('sorts users by email', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');

        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Jane Smith');
        expect(userItems[1]).toHaveTextContent('John Doe');
    });

    test.skip('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, 'EMPLOYEE');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test.skip('handles pagination', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');

        const pagination = screen.getByRole('button', { name: /2/i });
        await userEvent.click(pagination);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('handles user deletion', async () => {
        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        await screen.findByText('Deletion of user failed!');
    });

    test('handles user edit navigation', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });

        render(<UserEmployeeListSchwer />);
        await screen.findByText('John Doe');

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        expect(pushMock).toHaveBeenCalledWith('/edit/JohnDoe');
    });
});
