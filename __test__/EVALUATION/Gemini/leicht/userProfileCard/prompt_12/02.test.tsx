import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup

- unnecessary import
- variable - 3

- 4 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -10
CleanCode: -20
Testumfang: 50
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: new Date('2023-04-01'),
    lastLoginDate: new Date('2023-04-08'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht', () => {
    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it.skip('expands and collapses additional information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 01/04/2023')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();
    });

    it('enables edit mode and saves changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, ' Jane');
        await userEvent.type(emailInput, ' jane.doe@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'John Doe Jane',
            email: 'john.doe@example.com jane.doe@example.com',
        });
    });

    it('shows snackbar message after saving changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, ' Jane');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: new Date() }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        render(
            <UserProfileCardLeicht
                userProfile={{
                    ...mockUserProfile,
                    registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();
    });

    it('deletes user profile', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={{
                    ...mockUserProfile,
                    registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });
});
