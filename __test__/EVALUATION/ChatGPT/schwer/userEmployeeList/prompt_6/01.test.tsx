import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- mock of wrong query instead of fetch
- waitFOr prefer findBy

- vairablen - 7
- unnecessary waitFor - 6

- 6 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -65
Tetumfang: 41,5
 */

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockedUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'EMPLOYEE' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN' },
];

describe('UserEmployeeListSchwer', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockedUsers,
            isError: false,
            refetch: jest.fn(),
        });

        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('should render the component', () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display users', async () => {
        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListSchwer />);
        const sortByEmail = screen.getByLabelText('Email');
        await user.click(sortByEmail);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('jane@example.com');
        expect(userItems[1]).toHaveTextContent('john@example.com');
    });

    it('should change filter role', async () => {
        render(<UserEmployeeListSchwer />);
        const filterRoleSelect = screen.getByLabelText('Filter by Role');
        await user.click(filterRoleSelect);
        await user.click(screen.getByRole('option', { name: 'ADMIN' }));

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should show snackbar on user deletion failure', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockedUsers,
            isError: false,
            refetch: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        });

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await screen.findByText('Deletion of user failed!');
    });

    it('should navigate to user edit page', async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-Jane Smith');
        await user.click(editButton);

        expect(push).toHaveBeenCalledWith('/edit/JaneSmith');
    });

    it.skip('should paginate users', async () => {
        render(<UserEmployeeListSchwer />);
        const paginationButton = screen.getByRole('button', { name: '2' });
        await user.click(paginationButton);

        // Assuming the mocked users exceed the first page limit
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
});
