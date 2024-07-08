import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';
import { useRouter } from 'next/router';

/*
- mocking of query
- prefer findBy instead of waitFor + getBy

- setup
- vairablen - 4

- 6 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -25
Tetumfang: 45,65
 */

jest.mock('@tanstack/react-query');
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'EMPLOYEE' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN' },
];

describe('UserEmployeeListSchwer', () => {
    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });
    });

    it('should render the component correctly', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();
        const sortByEmail = screen.getByLabelText('Email');

        await user.click(sortByEmail);
        expect(sortByEmail).toBeChecked();

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();
        const roleFilter = screen.getByLabelText('Filter by Role');

        await user.click(roleFilter);
        await user.click(screen.getByRole('option', { name: 'EMPLOYEE' }));

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it.skip('should paginate users', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /2/i }));
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should show snackbar on deletion error', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: mockUsers,
            isError: false,
            refetch: jest.fn().mockRejectedValue(new Error('Deletion of user failed!')),
        });

        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await user.click(screen.getByLabelText('delete-John Doe'));
        await screen.findByText('Deletion of user failed!');
    });

    it.skip('should route to user edit page on edit button click', async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        await user.click(screen.getByLabelText('edit-John Doe'));
        expect(push).toHaveBeenCalledWith('/edit/JohnDoe');
    });
});
