import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- mock of wrong query instead of fetch

- vairablen - 6
- unused import - 2

- 8 von 12 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -40
Testumfang: 62,25
 */

// Mock external dependencies
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe('UserEmployeeListSchwer Component', () => {
    const users = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    beforeEach(() => {
        mockedUseQuery.mockReturnValue({
            data: users,
            isError: false,
            refetch: jest.fn(),
        });
        mockedUseRouter.mockReturnValue({
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
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle search input change', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'Jane');

        expect(searchInput).toHaveValue('Jane');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should handle sort by selection', async () => {
        render(<UserEmployeeListSchwer />);
        const nameSortRadio = screen.getByLabelText('Name');
        const emailSortRadio = screen.getByLabelText('Email');

        expect(nameSortRadio).toBeChecked();
        await userEvent.click(emailSortRadio);

        expect(emailSortRadio).toBeChecked();
        expect(nameSortRadio).not.toBeChecked();
    });

    it.skip('should handle role filter change', async () => {
        render(<UserEmployeeListSchwer />);
        const filterSelect = screen.getByLabelText('Filter by Role');

        await userEvent.click(filterSelect);
        await userEvent.selectOptions(filterSelect, screen.getByText('ADMIN'));

        expect(filterSelect).toHaveValue(USER_ROLE.ADMIN);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should handle pagination', async () => {
        mockedUseQuery.mockReturnValue({
            data: new Array(12).fill(0).map((_, i) => ({
                name: `User ${i}`,
                email: `user${i}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            })),
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('User 0')).toBeInTheDocument();
        expect(screen.queryByText('User 5')).not.toBeInTheDocument();

        const nextPageButton = screen.getByLabelText('Go to page 2');
        await userEvent.click(nextPageButton);

        expect(screen.getByText('User 5')).toBeInTheDocument();
        expect(screen.queryByText('User 0')).not.toBeInTheDocument();
    });

    it('should show snackbar message on user deletion failure', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');

        await userEvent.click(deleteButton);

        await screen.findByText('Deletion of user failed!');
    });

    it('should handle edit user navigation', async () => {
        const push = jest.fn();
        mockedUseRouter.mockReturnValue({ push });
        render(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');

        await userEvent.click(editButton);

        expect(push).toHaveBeenCalledWith('/edit/JohnDoe');
    });

    it('should display error message if API call fails', () => {
        mockedUseQuery.mockReturnValue({
            data: [],
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
    });

    it('should display no users message if no users are fetched', () => {
        mockedUseQuery.mockReturnValue({
            data: [],
            isError: false,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);
        expect(screen.getByText('No Users created')).toBeInTheDocument();
    });
});
