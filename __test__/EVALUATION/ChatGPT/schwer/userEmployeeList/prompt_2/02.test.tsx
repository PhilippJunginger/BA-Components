import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mock of wrong query instead of fetch
- waitFor assertions

- vairablen - 6
- unnecessary waitFor

- 9 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -35
Testumfang: 70,55
 */

// Mocking useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mocking useQuery
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

describe('UserEmployeeListSchwer Component', () => {
    const user = userEvent.setup();

    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    ];

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

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component and display user list', () => {
        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should handle search input', async () => {
        render(<UserEmployeeListSchwer />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should handle sort by selection', async () => {
        render(<UserEmployeeListSchwer />);

        const nameRadio = screen.getByLabelText('Name');
        await user.click(nameRadio);
        expect(nameRadio).toBeChecked();

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);
        expect(emailRadio).toBeChecked();
    });

    it('should handle role filter change', async () => {
        render(<UserEmployeeListSchwer />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        await user.click(employeeOption);

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it.skip('should handle page change', async () => {
        render(<UserEmployeeListSchwer />);

        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '2' }));
        expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'true');
    });

    it.skip('should handle user deletion', async () => {
        const refetch = jest.fn().mockResolvedValue({ data: mockUsers });
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch,
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(refetch).toHaveBeenCalled();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('should handle navigation to user edit page', async () => {
        const routerPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: routerPush,
        });

        render(<UserEmployeeListSchwer />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(routerPush).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('should show snackbar on user deletion failure', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsers,
            isError: false,
            refetch: jest.fn(),
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);

        const deleteButton = screen.getByLabelText('delete-Jane Smith');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    it('should display error alert when fetch fails', () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: null,
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('should display no users created alert', () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });
});
