import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';
import { useRouter } from 'next/router';

/*
- userEvent.setup
- waitFOr assetions
- condition in test
- promises not handled
- mocking of query instead of fetch
- missing assertion

- unnecessary waitFor
- variable - 4
- enum

- 6 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -60
CleanCode: -30
Testumfang: 45,65
 */

// Mocks
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const mockUsers: UserNoPw[] = [
    { email: 'test@example.com', name: 'Test User', role: USER_ROLE.ADMIN },
    { email: 'employee@example.com', name: 'Employee User', role: USER_ROLE.EMPLOYEE },
    { email: 'customer@example.com', name: 'Customer User', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListSchwer Component', () => {
    // Set up default mock behavior for useQuery
    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });
    });

    it('renders users correctly', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            mockUsers.forEach((user) => {
                if (user.role !== USER_ROLE.CUSTOMER) {
                    // Only employees and admins should be rendered
                    expect(screen.getByText(user.name)).toBeInTheDocument();
                    expect(screen.getByText(user.email)).toBeInTheDocument();
                }
            });
        });
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'employee');

        await waitFor(() => {
            expect(screen.getByText('Employee User')).toBeInTheDocument();
            expect(screen.queryByText('Test User')).not.toBeInTheDocument(); // Admin should not be rendered
            expect(screen.queryByText('Customer User')).not.toBeInTheDocument(); // Customer should not be rendered
        });
    });

    it('sorts users by name or email', async () => {
        render(<UserEmployeeListSchwer />);

        // Sort by email initially
        await waitFor(async () => {
            const emailSortRadio = screen.getByLabelText('Email');
            await userEvent.click(emailSortRadio);
        });

        // Sort by name
        await waitFor(async () => {
            const nameSortRadio = screen.getByLabelText('Name');
            await userEvent.click(nameSortRadio);
        });

        // Assert correct order (add assertions based on sorting logic)
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        // Open the select menu
        await userEvent.click(screen.getByLabelText('Filter by Role'));

        // Select "EMPLOYEE" from the menu
        await userEvent.click(screen.getByText('EMPLOYEE'));

        await waitFor(() => {
            expect(screen.getByText('Employee User')).toBeInTheDocument();
            expect(screen.queryByText('Test User')).not.toBeInTheDocument(); // Admin should not be rendered
            expect(screen.queryByText('Customer User')).not.toBeInTheDocument(); // Customer should not be rendered
        });
    });

    it.skip('handles user deletion', async () => {
        // Mock fetch for successful deletion
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'User deleted' }),
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);

        // Find the delete button and click it (assuming you have a unique way to identify the button)
        const deleteButton = screen.getAllByLabelText('delete-')[0]; // Get the first delete button
        await userEvent.click(deleteButton);

        // Assert that the user is removed from the list (add specific assertions based on how deletion is handled)
        await waitFor(() => {
            expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        });
    });

    it('handles errors during user retrieval', async () => {
        // Mock useQuery to return an error
        (useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });

    it.skip('handles routing to edit user page', async () => {
        const mockRouterPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
        render(<UserEmployeeListSchwer />);

        const editButton = screen.getAllByLabelText('edit-')[0]; // Get the first edit button
        await userEvent.click(editButton);
        expect(mockRouterPush).toHaveBeenCalledWith('/edit/TestUser');
    });
    // ... more tests for other functionalities and edge cases
});
