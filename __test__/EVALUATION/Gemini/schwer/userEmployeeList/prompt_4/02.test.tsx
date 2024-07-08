import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useQuery } from '@tanstack/react-query';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking query instread of fetch
- userEvent
- fireEvent
- wrong testing lib

- variable - 3


- 8 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -60
CleanCode: -15
Testumfang: 62,25
 */

vi.mock('@tanstack/react-query');

const mockUsers: UserNoPw[] = [
    {
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        email: 'test.user@example.com',
        name: 'Test User',
        role: USER_ROLE.EMPLOYEE,
    },
];

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        vi.mocked(useQuery).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: vi.fn(),
        });
    });

    it('should render user list correctly', () => {
        render(<UserEmployeeListSchwer />);

        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const sortSelect = screen.getByLabelText('Sort by');
        fireEvent.click(sortSelect);
        const sortOption = screen.getByLabelText('Name');
        fireEvent.click(sortOption);
        const userNames = screen.getAllByText(/Doe/);
        expect(userNames[0].textContent).toBe('Jane Doe');
        expect(userNames[1].textContent).toBe('John Doe');
    });

    it('should handle user deletion', async () => {
        const refetch = vi.fn();
        vi.mocked(useQuery).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch,
        });

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getAllByLabelText(/delete-/i)[0];
        fireEvent.click(deleteButton);

        expect(refetch).toHaveBeenCalled();
    });

    it('should handle routing to edit user page', async () => {
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getAllByLabelText(/edit-/i)[0];
        fireEvent.click(editButton);
        // Add assertion to check if the router has pushed the correct route
    });

    it('should display error message when fetching users fails', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isError: true,
            refetch: vi.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('An error occurred while retrieving users')).toBeVisible();
    });

    it('should display a message when no users are found', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: [],
            isError: false,
            refetch: vi.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('No Users created')).toBeVisible();
    });

    it('should display a message when no users match the search criteria', () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Nonexistent User' } });

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
