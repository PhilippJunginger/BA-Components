import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- interface
- node access
- conditional assertion

- variable - 5
- render Fhnktion

- 5 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -40
CleanCode: -30
Testumfang: 66,8
 */

const testUsers: UserNoPw[] = [
    { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'John Smith', email: 'john.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: USER_ROLE.CUSTOMER },
];

const setup = (props: any = {}) => {
    const utils = render(<UserEmployeeListLeicht fetchedUsers={props.fetchedUsers || []} />);
    return {
        ...utils,
    };
};

describe('UserEmployeeListLeicht', () => {
    it('should render the component with title', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a list of users when fetchedUsers is provided', () => {
        setup({ fetchedUsers: testUsers });
        testUsers.forEach((user) => {
            if (user.role !== USER_ROLE.CUSTOMER) {
                expect(screen.getByText(user.name)).toBeVisible();
                expect(screen.getByText(user.email)).toBeVisible();
            }
        });
    });

    it('should filter the list of users based on search term', async () => {
        setup({ fetchedUsers: testUsers });
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });

    it('should sort the list of users by name', async () => {
        setup({ fetchedUsers: testUsers });
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Jane Doe');
        expect(userItems[1]).toHaveTextContent('John Smith');
    });

    it.skip('should sort the list of users by email', async () => {
        setup({ fetchedUsers: testUsers });
        const emailRadioButton = screen.getByLabelText('Email');
        fireEvent.click(emailRadioButton);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('alice.johnson@example.com');
        expect(userItems[1]).toHaveTextContent('jane.doe@example.com');
    });

    it('should remove a user from the list when the delete button is clicked', async () => {
        setup({ fetchedUsers: testUsers });
        const deleteButton = screen.getByLabelText('delete-John Smith');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });

    it('should display a message when no users are available', () => {
        setup();
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display a message when no users match the search term', async () => {
        setup({ fetchedUsers: testUsers });
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it.skip('should display the correct icon based on user role', () => {
        setup({ fetchedUsers: testUsers });
        expect(screen.getByText('Jane Doe').parentElement?.querySelector('svg')).toHaveAttribute(
            'data-testid',
            'BadgeIcon',
        );
        expect(screen.getByText('John Smith').parentElement?.querySelector('svg')).toHaveAttribute(
            'data-testid',
            'SupervisorAccountIcon',
        );
    });
});
