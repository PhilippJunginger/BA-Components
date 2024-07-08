import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mocking of query
- waitFOr prefer findBy
- promises
- setup

- vairablen - 4
- enum

- 8 von 12 notwendigen Testfälen erreicht + 3 Redundanz


Best-Practices: -40
CleanCode: -25
Tetumfang: 53,95
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
];

describe('UserEmployeeListSchwer Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });
    });

    it('should render the component', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should show entered value in search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
    });

    it('should change sort by selection', async () => {
        render(<UserEmployeeListSchwer />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);
        expect(emailRadio).toBeChecked();
        expect(nameRadio).not.toBeChecked();
    });

    it('should change role filter selection', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        const adminOption = screen.getByRole('option', { name: 'ADMIN' });
        await user.click(adminOption);
        expect(roleSelect).toHaveValue('ADMIN');
    });

    it('should display users in the list', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle edit button click', async () => {
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);
        await waitFor(() => expect(window.location.pathname).toBe('/edit/JohnDoe'));
    });

    it('should handle delete button click and show snackbar on failure', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn().mockRejectedValue(new Error('Deletion of user failed!')),
        });
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        await screen.findByText('Deletion of user failed!');
    });

    it('should handle pagination', async () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('button', { name: '2' });
        await user.click(pagination);
        expect(pagination).toHaveAttribute('aria-current', 'true');
    });

    it('should show error alert on fetch error', () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: null,
            isError: true,
            refetch: jest.fn(),
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('should show no users created alert', () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });

    it('should show no matching users alert', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
