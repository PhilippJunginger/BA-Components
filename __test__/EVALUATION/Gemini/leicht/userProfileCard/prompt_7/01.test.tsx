import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- fireEvent
- promises

- render FUnktion
- variable - 3

- 3 von 5 notwendigem Testumfang erreicht + 5 Redundanz

Best-Practices: -30
CleanCode: -20
Testumfang: 10
 */

const testUserProfile: UserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date('2023-04-01T12:00:00.000Z'),
    lastLoginDate: new Date('2023-04-05T12:00:00.000Z'),
};

const testCurrentUser: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
};

const setup = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    return render(
        <UserProfileCardLeicht
            userProfile={userProfile || testUserProfile}
            setUserProfile={jest.fn()}
            currentUser={currentUser || testCurrentUser}
        />,
    );
};

describe('UserProfileCardLeicht', () => {
    it('renders user profile information correctly', () => {
        setup();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it.skip('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 01/04/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 05/04/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date:')).not.toBeVisible();
    });

    it.skip('allows editing user profile for current user', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });
        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');

        await userEvent.type(nameInput, 'Updated Name');
        await userEvent.type(emailInput, 'updated@example.com');

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(screen.getByText('Updated Name')).toBeInTheDocument();
        expect(screen.getByText('Email: updated@example.com')).toBeInTheDocument();
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setDate(recentRegistrationDate.getDate() - 1);
        const userProfileWithRecentRegistration: UserProfile = {
            ...testUserProfile,
            registrationDate: recentRegistrationDate,
        };
        setup(userProfileWithRecentRegistration);
        expect(screen.getByRole('button', { name: 'Delete User' })).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);
        const userProfileWithOldRegistration: UserProfile = {
            ...testUserProfile,
            registrationDate: oldRegistrationDate,
        };
        setup(userProfileWithOldRegistration);
        expect(screen.getByRole('button', { name: 'Delete User' })).toBeEnabled();
    });

    it.skip('deletes user profile when delete button is clicked', async () => {
        const setUserProfile = jest.fn();
        setup(testUserProfile, { ...testCurrentUser, id: '2' });
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);
        const userProfileWithOldRegistration: UserProfile = {
            ...testUserProfile,
            registrationDate: oldRegistrationDate,
        };
        setup(userProfileWithOldRegistration, testCurrentUser);
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        await userEvent.click(deleteButton);

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('hides action buttons for other users', () => {
        setup(testUserProfile, { ...testCurrentUser, id: '2' });
        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete User' })).not.toBeInTheDocument();
    });

    it.skip('closes the snackbar when the close button is clicked', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });

        await userEvent.type(nameInput, 'Updated Name');

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(screen.getByText('User edited successfully')).toBeVisible();

        const closeSnackbarButton = screen.getByRole('button', { name: 'close' });
        fireEvent.click(closeSnackbarButton);
        expect(screen.queryByText('User edited successfully')).not.toBeVisible();
    });
});
