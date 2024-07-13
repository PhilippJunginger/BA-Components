import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, IconButton } from '@mui/material';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- redundant await - 2
- fireEvent

- unused import
- typeerror - 4
- variable - 4


- 6 von 8 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -40
CleanCode: -45
Testumfang: 50
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
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

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-picture.jpg',
        );
    });

    it.skip('expands and collapses additional details', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 03/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 03/16/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();
    });

    it.skip('allows editing user profile information', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textfield', { name: 'Name' });
        const emailInput = screen.getByRole('textfield', { name: 'Email' });

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

    it.skip('uploads a new profile image', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-picture.jpg' }),
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

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-picture.jpg',
        });
    });

    it.skip('shows a snackbar message on successful user edit', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textfield', { name: 'Name' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('deletes the user profile', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
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

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setTime(recentRegistrationDate.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago

        render(
            <UserProfileCardMittel
                userProfile={{ ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });

    it.skip('shows a snackbar message if image upload fails', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to upload image'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('shows a snackbar message if user deletion fails', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to delete user'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it.skip('closes the snackbar when the close button is clicked', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to delete user'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        const snackbar = screen.getByText('Failed to delete user');
        const closeButton = within(snackbar).getByRole('button');
        await userEvent.click(closeButton);

        expect(screen.queryByText('Failed to delete user')).not.toBeVisible();
    });
});
