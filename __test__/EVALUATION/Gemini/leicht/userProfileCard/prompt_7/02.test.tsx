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
- render FUnktion
- variable - 3

- 5 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -10
CleanCode: -25
Testumfang: 70
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
            setUserProfile={jest.fn()}
            currentUser={currentUser || testCurrentUser}
        />,
    );
};

describe('UserProfileCardLeicht', () => {
    it('renders user profile information', () => {
        setup();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    });

    it.skip('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 04/01/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 04/05/2023')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 04/01/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 04/05/2023')).not.toBeVisible();
    });

    it.skip('allows editing user profile information', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'updated@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(screen.getByText('Updated Name')).toBeInTheDocument();
        expect(screen.getByText('Email: updated@example.com')).toBeInTheDocument();
    });

    it('shows a snackbar message after editing', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 20);
        const recentUserProfile = { ...testUserProfile, registrationDate: recentRegistrationDate };
        setup(recentUserProfile);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);
        const oldUserProfile = { ...testUserProfile, registrationDate: oldRegistrationDate };
        setup(oldUserProfile);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeEnabled();
    });

    it.skip('calls setUserProfile with undefined when delete button is clicked', async () => {
        const setUserProfileMock = jest.fn();
        setup(testUserProfile, testCurrentUser);

        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);
        const oldUserProfile = { ...testUserProfile, registrationDate: oldRegistrationDate };
        setup(oldUserProfile, testCurrentUser);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
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
});
