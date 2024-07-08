import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useQuery } from '@tanstack/react-query';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking query instread of fetch
- userEvent
- fireEvent
- node access
- wrong testing lib

- variable - 6


- 8 von 12 notwendigem Testumfang erreicht + 1 A + 1 Redudndanz


Best-Practices: -70
CleanCode: -30
Testumfang: 62,25
 */

vi.mock('@tanstack/react-query');
vi.mock('next/router', () => ({
    useRouter: vi.fn().mockReturnValue({
        push: vi.fn(),
    }),
}));

const mockUsers: UserNoPw[] = [
    { email: 'test@test.com', name: 'Test User', role: USER_ROLE.ADMIN },
    { email: 'jane@example.com', name: 'Jane Doe', role: USER_ROLE.EMPLOYEE },
    { email: 'john@example.com', name: 'John Smith', role: USER_ROLE.CUSTOMER },
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
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    it('should filter users based on search term', () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('should sort users by name', () => {
        render(<UserEmployeeListSchwer />);
        const sortBySelect = screen.getByLabelText('Sort by').querySelector('input[value="name"]')!;
        fireEvent.click(sortBySelect);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('Test User');
    });

    it('should sort users by email', () => {
        render(<UserEmployeeListSchwer />);
        const sortBySelect = screen.getByLabelText('Sort by').querySelector('input[value="email"]')!;
        fireEvent.click(sortBySelect);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('jane@example.com');
    });

    it('should filter users by role', () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByText('Test User')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('should display a message when no users match the search criteria', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: vi.fn(),
        });

        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Nonexistent User' } });
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('should handle user deletion', async () => {
        const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({}),
        } as Response);

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getAllByLabelText('delete-')[0];
        fireEvent.click(deleteButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user?email=test@test.com', { method: 'POST' });
    });

    it('should handle user edit navigation', async () => {
        const routerPushMock = vi.fn();
        vi.mock('next/router', () => ({
            useRouter: () => ({ push: routerPushMock }),
        }));

        render(<UserEmployeeListSchwer />);
        const editButton = screen.getAllByLabelText('edit-')[0];
        fireEvent.click(editButton);

        expect(routerPushMock).toHaveBeenCalledWith('/edit/TestUser');
    });

    it('should display an error message when fetching users fails', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isError: true,
            refetch: vi.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeVisible();
    });

    it('should display a message when no users are created', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: [],
            isError: false,
            refetch: vi.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeVisible();
    });
});
