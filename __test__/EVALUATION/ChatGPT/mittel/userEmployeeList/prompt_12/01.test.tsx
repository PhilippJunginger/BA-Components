import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- render in beforeEach

- unused import
- vairablen - 7

- 6 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -40
Testumfang: 55
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
    });

    it('should render the component with initial users', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('alice@example.com');
        expect(userItems[1]).toHaveTextContent('jane@example.com');
        expect(userItems[2]).toHaveTextContent('john@example.com');
    });

    it('should filter users by role', async () => {
        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        await user.click(employeeOption);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it.skip('should paginate users', async () => {
        const pagination = screen.getByRole('navigation');
        await user.click(screen.getByRole('button', { name: '2' }));
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should remove user from the list', async () => {
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should navigate to user edit page', async () => {
        const editButton = screen.getByLabelText('edit-Jane Smith');
        await user.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Jane Smith');
    });
});
