import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- fireEvent
- node access

- typeerror - 8
- variable - 4


- 7 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -60
Testumfang: 81,25
 */

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render user profile information', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it.skip('should expand and collapse user details', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 03/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 03/16/2023')).toBeVisible();

        await userEvent.click(expandButton);

        // Expect details to be hidden (not present in the DOM)
        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 03/16/2023')).not.toBeInTheDocument();
    });

    it('should enter edit mode and save changes', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it.skip('should upload a new profile image', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
        });

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        // Wait for the state update
        await screen.findByText('User edited successfully');

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-image.jpg',
        });
    });

    it.skip('should handle image upload errors', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to upload image'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        // Wait for the error message
        await screen.findByText('Failed to upload image');
    });

    it('should delete the user', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        render(
            <UserProfileCardMittel
                userProfile={{ ...mockUserProfile, registrationDate: '2023-03-14T10:00:00.000Z' }} // Set registration date to be older than 24 hours
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('should handle user deletion errors', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to delete user'));

        render(
            <UserProfileCardMittel
                userProfile={{ ...mockUserProfile, registrationDate: '2023-03-14T10:00:00.000Z' }} // Set registration date to be older than 24 hours
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        // Wait for the error message
        await screen.findByText('Failed to delete user');
    });

    it.skip('should disable delete button for recently registered users', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });
});
