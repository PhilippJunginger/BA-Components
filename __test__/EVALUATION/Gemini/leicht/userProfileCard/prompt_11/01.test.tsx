import React from 'react';
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

- 4 von 5 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -10
CleanCode: -20
Testumfang: 40
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: new Date('2023-04-01T10:00:00.000Z'),
    lastLoginDate: new Date('2023-04-05T12:00:00.000Z'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

describe('UserProfileCardLeicht', () => {
    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
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
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 04/01/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 04/05/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 04/01/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 04/05/2023')).not.toBeVisible();
    });

    it('allows editing and saving user profile', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it('shows snackbar message after editing user profile', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23); // Set registration time to 23 hours ago

        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: recentRegistrationDate }}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        const setUserProfileMock = jest.fn();
        const oldRegistrationDate = new Date('2023-03-31T10:00:00.000Z');

        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: oldRegistrationDate }}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();
    });

    it('deletes user profile when delete button is clicked', async () => {
        const setUserProfileMock = jest.fn();
        const oldRegistrationDate = new Date('2023-03-31T10:00:00.000Z');

        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: oldRegistrationDate }}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    it.skip('closes snackbar when close button is clicked', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);

        expect(screen.queryByText('User edited successfully')).not.toBeVisible();
    });
});
