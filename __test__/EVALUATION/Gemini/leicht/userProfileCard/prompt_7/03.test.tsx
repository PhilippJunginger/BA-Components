import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- fireEVent

- render FUnktion
- variable - 3

- 4 von 5 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 30
 */

const testUserProfile: UserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
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
    render(
        <UserProfileCardLeicht
            userProfile={userProfile || testUserProfile}
            setUserProfile={() => {}}
            currentUser={currentUser || testCurrentUser}
        />,
    );
};

describe('UserProfileCard', () => {
    it('renders user profile information', () => {
        setup();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    });

    it.skip('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText('Registration Date: 04/01/2023')).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 04/01/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 04/05/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 04/01/2023')).not.toBeVisible();
    });

    it.skip('allows editing user profile for the current user', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });
        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');

        await userEvent.type(nameInput, ' Edited');
        await userEvent.type(emailInput, 'edited@example.com');

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(screen.getByText('Test User Edited')).toBeInTheDocument();
        expect(screen.getByText('Email: testedited@example.com')).toBeInTheDocument();
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 20);
        const recentUserProfile = { ...testUserProfile, registrationDate: recentRegistrationDate };
        setup(recentUserProfile);
        expect(screen.getByRole('button', { name: 'Delete User' })).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);
        const oldUserProfile = { ...testUserProfile, registrationDate: oldRegistrationDate };
        setup(oldUserProfile);
        expect(screen.getByRole('button', { name: 'Delete User' })).toBeEnabled();
    });

    it('deletes user profile', async () => {
        const setUserProfile = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={testUserProfile}
                setUserProfile={setUserProfile}
                currentUser={testCurrentUser}
            />,
        );
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        await userEvent.click(deleteButton);

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('hides action buttons for other users', () => {
        const differentUser: UserWithId = {
            id: '2',
            name: 'Another User',
            email: 'another@example.com',
            password: 'password',
        };
        setup(testUserProfile, differentUser);
        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete User' })).not.toBeInTheDocument();
    });

    it.skip('closes the snackbar', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(screen.getByText('User edited successfully')).toBeVisible();

        const closeSnackbarButton = screen.getByRole('button', { name: 'close' });
        fireEvent.click(closeSnackbarButton);

        expect(screen.queryByText('User edited successfully')).not.toBeVisible();
    });
});
