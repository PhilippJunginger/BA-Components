import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- promises
- mock of wrong query instead of fetch
- fireEvent

- vairablen - 4

- 9 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -20
Testumfang: 66,4
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.ADMIN },
];

const renderComponent = () => render(<UserEmployeeListSchwer />);

describe('UserEmployeeListSchwer', () => {
    const refetchMock = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: refetchMock,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it.skip('should render the component correctly', () => {
        renderComponent();
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    it('should render users correctly', () => {
        renderComponent();
        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users by search term', async () => {
        renderComponent();
        await userEvent.type(screen.getByLabelText('Search Users'), 'John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it.skip('should sort users by name or email', async () => {
        renderComponent();
        await userEvent.click(screen.getByLabelText('Email'));
        const sortedUsers = [...mockUsers].sort((a, b) => a.email.localeCompare(b.email));
        sortedUsers.forEach((user, index) => {
            expect(screen.getAllByText(user.email)[index]).toBeInTheDocument();
        });
    });

    it.skip('should filter users by role', async () => {
        renderComponent();
        await userEvent.selectOptions(screen.getByLabelText('Filter by Role'), USER_ROLE.ADMIN);
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should handle page change', () => {
        renderComponent();
        fireEvent.change(screen.getByRole('button', { name: /next page/i }), { target: { value: 2 } });
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should navigate to user edit page on edit button click', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
        renderComponent();
        await userEvent.click(screen.getByLabelText('edit-John Doe'));
        expect(pushMock).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('should show error message on deletion failure', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        ) as jest.Mock;
        renderComponent();
        await userEvent.click(screen.getByLabelText('delete-John Doe'));
        expect(await screen.findByText('Deletion of user failed!')).toBeInTheDocument();
    });

    it.skip('should display an error message when fetching users fails', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: true,
            refetch: jest.fn(),
        });
        renderComponent();
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it.skip('should display a message when no users are created', () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });
        renderComponent();
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    it('should display a message when no users match the search criteria', async () => {
        renderComponent();
        await userEvent.type(screen.getByLabelText('Search Users'), 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
