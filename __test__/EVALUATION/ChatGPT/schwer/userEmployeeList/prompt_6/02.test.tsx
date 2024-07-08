import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mock of wrong query instead of fetch
- setup

- waitFor unnecessary - 2
- vairablen - 4
- typeerror - 3
- enum

- 7 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -50
Tetumfang: 53,95
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const mockUsers = [
    { name: 'Alice', email: 'alice@example.com', role: 'ADMIN' },
    { name: 'Bob', email: 'bob@example.com', role: 'EMPLOYEE' },
];

describe('UserEmployeeListSchwer Component', () => {
    const refetchMock = jest.fn();

    beforeEach(() => {
        useQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: refetchMock,
        });
    });

    it('should render the component', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should show entered value in the search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(searchInput).toHaveValue('Alice');
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('should change the sort by selection', async () => {
        render(<UserEmployeeListSchwer />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        expect(emailRadio).toBeChecked();
        expect(nameRadio).not.toBeChecked();
    });

    it('should change the role filter selection', async () => {
        render(<UserEmployeeListSchwer />);
        const roleFilter = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleFilter);
        const adminOption = screen.getByRole('option', { name: 'ADMIN' });
        await userEvent.selectOptions(roleFilter, adminOption);
        expect(adminOption.selected).toBe(true);
    });

    it('should show the correct pagination count', () => {
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
    });

    it('should handle user deletion and show snackbar on failure', async () => {
        useQuery.mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: refetchMock,
        });
        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(refetchMock).toHaveBeenCalled();
        });
        expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
    });

    it('should navigate to edit user page on edit button click', async () => {
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-Alice');
        await userEvent.click(editButton);
        await waitFor(() => {
            expect(screen.queryByText('/edit/Alice')).not.toBeInTheDocument();
        });
    });
});
