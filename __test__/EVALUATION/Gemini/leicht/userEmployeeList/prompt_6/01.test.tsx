import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- interface
- node access

- variable - 5
- unused import
- render Fhnktion

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 3 Redundazen


Best-Practices: -30
CleanCode: -35
Testumfang: 41,75
 */

const testUsers: UserNoPw[] = [
    {
        email: 'test.user@test.com',
        name: 'Test User',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        role: USER_ROLE.ADMIN,
    },
];

const setup = (props: any = {}) => {
    const utils = render(<UserEmployeeListLeicht fetchedUsers={props.fetchedUsers || []} />);
    return {
        ...utils,
    };
};

describe('UserEmployeeListLeicht Component', () => {
    it('should render the component with the correct title', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a list of users when fetchedUsers is provided', () => {
        setup({ fetchedUsers: testUsers });
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter the user list based on search input', async () => {
        setup({ fetchedUsers: testUsers });
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it.skip('should sort the user list by name', async () => {
        setup({ fetchedUsers: testUsers });
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[0].trim());
        expect(userNames).toEqual(['Jane Doe', 'Test User']);
    });

    it.skip('should sort the user list by email', async () => {
        setup({ fetchedUsers: testUsers });
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[1].trim());
        expect(userEmails).toEqual(['jane.doe@example.com', 'test.user@test.com']);
    });

    it.skip('should remove a user from the list when the delete button is clicked', async () => {
        setup({ fetchedUsers: testUsers });
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('should display an alert message when no users are available', () => {
        setup();
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display an alert message when no users match the search criteria', async () => {
        setup({ fetchedUsers: testUsers });
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it.skip('should render the correct icon for each user role', () => {
        setup({ fetchedUsers: testUsers });
        expect(
            screen.getByText('Test User').parentElement?.querySelector('svg[data-testid="SupervisorAccountIcon"]'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Jane Doe').parentElement?.querySelector('svg[data-testid="BadgeIcon"]'),
        ).toBeInTheDocument();
    });
});
