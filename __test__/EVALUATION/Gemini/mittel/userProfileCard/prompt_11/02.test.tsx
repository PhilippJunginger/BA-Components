import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- fireEvent
- node access

- variable - 3
- typeerro - 2
- render Funktion

- 7 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -30
Testumfang: 75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'test.jpg',
    registrationDate: '2023-04-01T12:00:00.000Z',
    lastLoginDate: '2023-04-01T12:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const renderComponent = (userProfile?: UserProfile, currentUser?: UserWithId) => {
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
        renderComponent();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    });

    it.skip('should expand and collapse the card content', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 04/01/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 04/01/2023')).toBeVisible();

        await userEvent.click(expandButton);
        // Expect the expanded content to no longer be visible
        // Note: Assertions for elements not present can be tricky and may vary based on your testing setup
        // Here's one approach using queryByText and expecting it to be null:
        expect(screen.queryByText('Registration Date: 04/01/2023')).toBeNull();
        expect(screen.queryByText('Last Login Date: 04/01/2023')).toBeNull();
    });

    it('should toggle edit mode and display input fields', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeVisible();
        expect(screen.getByLabelText('Email')).toBeVisible();
        expect(screen.getByText('Change Profile Picture')).toBeVisible();
    });

    it.skip('should update user profile on edit and save', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        await userEvent.type(nameInput, ' Edited');
        await userEvent.type(emailInput, 'edited@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Test User Edited',
            email: 'edited@example.com',
        });
    });

    it.skip('should handle image upload', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen
            .getByText('Change Profile Picture')
            .querySelector('input[type="file"]') as HTMLInputElement;
        const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput, mockFile);

        // Mock the fetch call and its response
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'new-test.jpg' }),
        });

        // Expect the fetch call to be made with the correct URL and FormData
        expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        // Expect the profile image URL to be updated
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'new-test.jpg',
        });
    });

    it('should handle image upload error', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        // Mock the fetch call to throw an error
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to upload image'));

        const fileInput = screen
            .getByText('Change Profile Picture')
            .querySelector('input[type="file"]') as HTMLInputElement;
        const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput, mockFile);

        // Expect the snackbar to show the error message
        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it.skip('should delete user on delete button click', async () => {
        const mockUserProfileToDelete = { ...mockUserProfile, id: '2' };
        const mockCurrentUserToDelete = { ...mockCurrentUser, id: '3' };
        renderComponent(mockUserProfileToDelete, mockCurrentUserToDelete);

        // Mock the fetch call and its response
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        // Expect the fetch call to be made with the correct URL and body
        expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '2' }),
        });

        // Expect setUserProfile to be called with undefined
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should handle delete user error', async () => {
        const mockUserProfileToDelete = { ...mockUserProfile, id: '2' };
        const mockCurrentUserToDelete = { ...mockCurrentUser, id: '3' };
        renderComponent(mockUserProfileToDelete, mockCurrentUserToDelete);

        // Mock the fetch call to throw an error
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to delete user'));

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        // Expect the snackbar to show the error message
        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it.skip('should disable delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23); // Set registration time to 23 hours ago

        const mockUserProfileRecentRegistration = {
            ...mockUserProfile,
            id: '2',
            registrationDate: recentRegistrationDate.toISOString(),
        };
        const mockCurrentUserToDelete = { ...mockCurrentUser, id: '3' };

        renderComponent(mockUserProfileRecentRegistration, mockCurrentUserToDelete);

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
