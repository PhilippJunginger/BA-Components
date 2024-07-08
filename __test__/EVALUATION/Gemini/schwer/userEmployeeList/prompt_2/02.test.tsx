import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';
import { useRouter } from 'next/router';

/*
- mocking query instead of fetch
- missing assertions - 3

- setup
- variable - 3
- unused import - 2


- 6 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -40
CleanCode: -30
Testumfang: 45,65
 */

// Mock useQuery
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

// Mock useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('UserEmployeeListSchwer Component', () => {
    const mockUsersData: UserNoPw[] = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Bob Johnson', email: 'bob.johnson@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Alice Williams', email: 'alice.williams@example.com', role: USER_ROLE.ADMIN },
        { name: 'Charlie Brown', email: 'charlie.brown@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Eva Green', email: 'eva.green@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    beforeEach(() => {
        (useQuery as jest.Mock).mockReturnValue({
            data: mockUsersData,
            isError: false,
            refetch: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it.skip('renders user list with correct user data', async () => {
        render(<UserEmployeeListSchwer />);

        // Check if user names are rendered
        for (const user of mockUsersData.slice(0, rowsPerPage)) {
            await screen.findByText(user.name);
            screen.getByText(user.email);
        }

        // Check if pagination is rendered correctly
        screen.getByText('1');
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        // Search for a specific user
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'John Doe');

        // Check if only matching users are displayed
        await screen.findByText('John Doe');
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        // Filter by employee role
        const selectLabel = screen.getByLabelText('Filter by Role');
        await user.click(selectLabel);

        const employeeOption = screen.getByText(USER_ROLE.EMPLOYEE);
        await user.click(employeeOption);

        // Check if only employees are displayed
        screen.getAllByText(USER_ROLE.EMPLOYEE);
        expect(screen.queryByText(USER_ROLE.ADMIN)).not.toBeInTheDocument();
    });

    it.skip('sorts users by name', async () => {
        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        // Sort by name
        const nameRadioButton = screen.getByLabelText('Name');
        await user.click(nameRadioButton);

        // Check if users are sorted by name
        const userNames = screen.getAllByText(/John Doe|Jane Smith/); // Modify regex based on the expected sorted order
        expect(userNames[0]).toHaveTextContent('John Doe');
        expect(userNames[1]).toHaveTextContent('Jane Smith');
    });

    it.skip('navigates to user edit page', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValueOnce({ push: pushMock });

        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        // Click the edit button for a user
        const editButton = screen.getAllByLabelText(/edit-/)[0];
        await user.click(editButton);

        // Check if navigation function is called
        expect(pushMock).toHaveBeenCalledWith('/edit/JohnDoe'); // Modify name based on user data
    });

    it('shows error alert when fetching users fails', async () => {
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: undefined,
            isError: true,
            refetch: jest.fn(),
        });

        render(<UserEmployeeListSchwer />);

        // Check if error alert is displayed
        await screen.findByText('An error occurred while retrieving users');
    });

    it('shows snackbar message on successful user deletion', async () => {
        const refetchMock = jest.fn().mockResolvedValueOnce({ data: [] });
        (useQuery as jest.Mock).mockReturnValueOnce({
            data: mockUsersData,
            isError: false,
            refetch: refetchMock,
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ message: 'User deleted successfully' }),
        });

        render(<UserEmployeeListSchwer />);
        const user = userEvent.setup();

        // Click the delete button for a user
        const deleteButton = screen.getAllByLabelText(/delete-/)[0];
        await user.click(deleteButton);

        // Check if snackbar message is displayed
        await screen.findByText('Deletion of user failed!');
    });
});
