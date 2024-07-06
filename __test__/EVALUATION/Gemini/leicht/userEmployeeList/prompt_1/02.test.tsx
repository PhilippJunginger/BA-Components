import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- fireEvent

- variable - 5
- unnecessary Funktion
- typeerror

- 6 von 6 notwendigem Testumfang erreicht + 1 A + 1 Redundazen


Best-Practices: -20
CleanCode: -35
Testumfang: 91,85
 */

const generateTestUsers = (): UserNoPw[] => [
    {
        userId: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: USER_ROLE.ADMIN,
    },
    {
        userId: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        userId: '3',
        name: 'David Johnson',
        email: 'david.johnson@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

describe('UserEmployeeListLeicht Component', () => {
    it('renders the component with user list', () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });

    it('does not render customer users', () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);
        expect(screen.queryByText('david.johnson@example.com')).not.toBeInTheDocument();
    });

    it('renders a message when there are no users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it.skip('filters users based on search input', () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'john' } });

        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Smith')).not.toBeVisible();
    });

    it.skip('sorts users by name', () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);
        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('John Doe');
        expect(userItems[1]).toHaveTextContent('Jane Smith');
    });

    it.skip('sorts users by email', () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('john.doe@example.com');
        expect(userItems[1]).toHaveTextContent('jane.smith@example.com');
    });

    it.skip('removes a user from the list', async () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);

        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('displays message when no users match search', () => {
        const users = generateTestUsers();
        render(<UserEmployeeListLeicht fetchedUsers={users} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
