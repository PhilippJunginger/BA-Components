import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- fireEvent
- interface usage

- variable - 4
- render Funktion

- 7 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -20
Testumfang: 68,75
 */

const mockUserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const setup = (userProfile?: any, currentUser?: UserWithId) => {
    render(
        <UserProfileCardMittel
            userProfile={userProfile || mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={currentUser || mockCurrentUser}
        />,
    );
};

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render user profile information correctly', () => {
        setup();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it.skip('should expand and collapse additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 3/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 3/16/2023')).toBeVisible();
        await userEvent.click(expandButton);
        // Expect the content to be collapsed and therefore not visible
        expect(screen.queryByText('Registration Date: 3/15/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 3/16/2023')).not.toBeVisible();
    });

    it.skip('should allow editing user profile information', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(nameInput, ' Edited');
        await userEvent.type(emailInput, 'edited@example.com');
        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Test User Edited',
            email: 'edited@example.com',
        });
    });

    it.skip('should handle image upload', async () => {
        setup();
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        // We need to mock the fetch call for the image upload
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
            }),
        ) as jest.Mock;
        await userEvent.upload(input, file);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-image.jpg',
        });
    });

    it('should show snackbar message on successful user edit', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, ' Edited');
        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('should handle user deletion', async () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setDate(recentRegistrationDate.getDate() - 1);
        const userProfileWithRecentRegistrationDate = {
            ...mockUserProfile,
            registrationDate: recentRegistrationDate.toISOString(),
        };
        setup(userProfileWithRecentRegistrationDate);
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        // We need to mock the fetch call for the user deletion
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;
        await userEvent.click(deleteButton);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should disable delete button for users registered less than 24 hours ago', () => {
        setup();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });

    it.skip('should show snackbar message on image upload error', async () => {
        setup();
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        // We need to mock the fetch call for the image upload error
        global.fetch = jest.fn(() => Promise.reject(new Error('Failed to upload image'))) as jest.Mock;
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);
        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('should show snackbar message on user deletion error', async () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setDate(recentRegistrationDate.getDate() - 1);
        const userProfileWithRecentRegistrationDate = {
            ...mockUserProfile,
            registrationDate: recentRegistrationDate.toISOString(),
        };
        setup(userProfileWithRecentRegistrationDate);
        // We need to mock the fetch call for the user deletion error
        global.fetch = jest.fn(() => Promise.reject(new Error('Failed to delete user'))) as jest.Mock;
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);
        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('should close the snackbar when the close button is clicked', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, ' Edited');
        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);
        const closeSnackbarButton = screen.getByRole('button', { name: 'close' });
        fireEvent.click(closeSnackbarButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
