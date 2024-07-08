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
- assertion missing

- variable - 3
- overly complicated test

- 8 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -70
CleanCode: -20
Testumfang: 62,25
 */

vi.mock('@tanstack/react-query');

const mockUsers: UserNoPw[] = [
    { email: 'john.doe@example.com', name: 'John Doe', role: USER_ROLE.ADMIN },
    { email: 'jane.doe@example.com', name: 'Jane Doe', role: USER_ROLE.EMPLOYEE },
    { email: 'jack.doe@example.com', name: 'Jack Doe', role: USER_ROLE.CUSTOMER },
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
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();

        mockUsers
            .filter((user) => user.role !== USER_ROLE.CUSTOMER)
            .forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
    });

    it('should filter users based on search term', () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });

        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort users by name or email', () => {
        render(<UserEmployeeListSchwer />);

        const sortBySelect = screen.getByLabelText('Sort by');
        fireEvent.click(sortBySelect);

        // Sort by email
        const emailOption = screen.getByText('Email');
        fireEvent.click(emailOption);
        expect(screen.getByText('john.doe@example.com')).toBeVisible();

        // Sort by name
        const nameOption = screen.getByText('Name');
        fireEvent.click(nameOption);
        expect(screen.getByText('Jane Doe')).toBeVisible();
    });

    it('should filter users by role', () => {
        render(<UserEmployeeListSchwer />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        fireEvent.click(roleSelect);

        // Filter by EMPLOYEE
        const employeeOption = screen.getByText('EMPLOYEE');
        fireEvent.click(employeeOption);
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should handle pagination correctly', () => {
        render(<UserEmployeeListSchwer />);

        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();

        // Check if only one page is displayed
        expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
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

    it('should display an error message when fetching users fails', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isError: true,
            refetch: vi.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('An error occurred while retrieving users')).toBeVisible();
    });

    it('should handle user deletion', async () => {
        const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({}),
        });

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getAllByLabelText(/delete-/i)[0];
        fireEvent.click(deleteButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user?email=john.doe@example.com', {
            method: 'POST',
        });
    });

    it('should handle user edit navigation', async () => {
        render(<UserEmployeeListSchwer />);

        const editButton = screen.getAllByLabelText(/edit-/i)[0];
        fireEvent.click(editButton);

        // Add assertion to check if the navigation happened correctly
    });
});
