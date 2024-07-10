import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup

- unused import
- variable - 3
- unnecessary functions to generate data - 2

- 5 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -30
Testumfang: 80
 */

const generateUserProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
    ...overrides,
});

const generateUserWithId = (overrides?: Partial<UserWithId>): UserWithId => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
    ...overrides,
});

describe('UserProfileCardLeicht', () => {
    it('should render user profile information', () => {
        const userProfile = generateUserProfile();
        const currentUser = generateUserWithId();
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', userProfile.profileImageUrl);
    });

    it('should handle expand button click', async () => {
        const userProfile = generateUserProfile();
        const currentUser = generateUserWithId();
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).toBeVisible();
        expect(
            screen.getByText(`Last Login Date: ${new Date(userProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeVisible();
    });

    it('should toggle edit mode', async () => {
        const userProfile = generateUserProfile();
        const currentUser = generateUserWithId();
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        await userEvent.click(editButton);

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    });

    it('should edit and save user profile', async () => {
        const userProfile = generateUserProfile();
        const currentUser = generateUserWithId();
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'updated@example.com');

        await userEvent.click(editButton);

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Updated Name',
            email: 'updated@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('should delete user profile', async () => {
        const userProfile = generateUserProfile();
        const currentUser = generateUserWithId();
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    it('should disable delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23); // Set registration time within 24 hours
        const userProfile = generateUserProfile({ registrationDate: recentRegistrationDate });
        const currentUser = generateUserWithId();
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('should handle closing the snackbar', async () => {
        const userProfile = generateUserProfile();
        const currentUser = generateUserWithId();
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );

        // Mock the edit flow to trigger the snackbar
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        await userEvent.click(editButton);

        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
