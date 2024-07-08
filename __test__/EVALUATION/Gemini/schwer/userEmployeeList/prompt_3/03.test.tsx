import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking query and fetch
- userEvent
- fireEvent
- render in beforeEach
- waitFor assertions

- not needed import
- usage of not needed import
- variable - 5
- unnecessary client provider
- query client creation in beforeEach
- query client creation in test

- 9 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -70
CleanCode: -50
Testumfang: 66,4
 */

const mockUsers: UserNoPw[] = [
    { email: 'admin@test.com', name: 'Admin User', role: USER_ROLE.ADMIN },
    { email: 'employee1@test.com', name: 'Employee One', role: USER_ROLE.EMPLOYEE },
    { email: 'employee2@test.com', name: 'Employee Two', role: USER_ROLE.EMPLOYEE },
    { email: 'employee3@test.com', name: 'Employee Three', role: USER_ROLE.EMPLOYEE },
    { email: 'employee4@test.com', name: 'Employee Four', role: USER_ROLE.EMPLOYEE },
    { email: 'employee5@test.com', name: 'Employee Five', role: USER_ROLE.EMPLOYEE },
];

const mockFetch = vi.fn(async (url: string) => {
    if (url === 'http://localhost:8080/users') {
        return {
            status: 200,
            json: async () => mockUsers,
        };
    } else if (url.startsWith('http://localhost:8080/user?email=')) {
        const email = url.split('=')[1];
        const userIndex = mockUsers.findIndex((user) => user.email === email);
        if (userIndex !== -1) {
            return {
                status: 200,
                json: async () => mockUsers.splice(userIndex, 1),
            };
        } else {
            return {
                status: 404,
                json: async () => ({ error: 'User not found' }),
            };
        }
    }
});

global.fetch = mockFetch;

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('fetches and displays users on mount', async () => {
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
                expect(screen.getByText(user.email)).toBeVisible();
            });
        });
    });

    it('filters users based on search term', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Employee One' } });
        await waitFor(() => {
            expect(screen.getByText('Employee One')).toBeVisible();
        });
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });

    it('sorts users by name or email', async () => {
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        fireEvent.click(screen.getByLabelText('Email'));
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')[0].textContent).toContain('admin@test.com');
        });
        fireEvent.click(screen.getByLabelText('Name'));
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')[0].textContent).toContain('Admin User');
        });
    });

    it('filters users by role', async () => {
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        await waitFor(() => {
            expect(screen.getByText('Admin User')).toBeVisible();
        });
        expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
    });

    it('paginates users correctly', async () => {
        await waitFor(() => {
            expect(screen.getByText('Employee One')).toBeVisible();
            expect(screen.getByText('Employee Five')).not.toBeVisible();
        });
        fireEvent.click(screen.getByLabelText('Go to page 2'));
        await waitFor(() => {
            expect(screen.getByText('Employee Five')).toBeVisible();
            expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
        });
    });

    it('deletes a user from the list', async () => {
        const userToDelete = mockUsers[1];
        const deleteButton = screen.getAllByLabelText('delete-')[1];
        fireEvent.click(deleteButton);
        await waitFor(() => {
            expect(screen.queryByText(userToDelete.email)).not.toBeInTheDocument();
        });
    });

    it('handles deletion failure gracefully', async () => {
        mockFetch.mockImplementationOnce(async (url: string) => {
            if (url.startsWith('http://localhost:8080/user?email=')) {
                return {
                    status: 500,
                    json: async () => ({ error: 'Failed to delete user' }),
                };
            }
            return {
                status: 200,
                json: async () => mockUsers,
            };
        });
        const deleteButton = screen.getAllByLabelText('delete-')[1];
        fireEvent.click(deleteButton);
        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeVisible();
        });
    });

    it('navigates to edit user page', async () => {
        const editButton = screen.getAllByLabelText('edit-')[1];
        fireEvent.click(editButton);
        await waitFor(() => {
            expect(screen.queryByText('Employee One')).not.toBeInTheDocument();
        });
    });

    it('displays a message when no users are found', async () => {
        mockFetch.mockResolvedValueOnce({
            status: 200,
            json: async () => [],
        });
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );
        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeVisible();
        });
    });

    it('displays an error message when fetching users fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to fetch users'));
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <UserEmployeeListSchwer />
            </QueryClientProvider>,
        );
        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeVisible();
        });
    });
});
