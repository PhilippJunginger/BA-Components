import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireEvent
- setup
- node access

- variable - 3
- typeerror - 5
- render Funktion



- 8 von 8 notwendigem Testumfang erreicht + 6 Redundanz

Best-Practices: -30
CleanCode: -45
Testumfang: 62,5
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
    registrationDate: '2023-03-17T10:00:00.000Z',
    lastLoginDate: '2023-03-18T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const mockFetch = jest.spyOn(global, 'fetch');

const setup = (userProfile?: UserProfile, currentUser?: UserWithId) => {
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

    it('renders user profile information correctly', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.getByText('Email: john.doe@example.com')).toBeVisible();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            'https://example.com/profile-picture.jpg',
        );
    });

    it('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText(/Registration Date:/i)).not.toBeInTheDocument();

        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/i)).toBeVisible();
        expect(screen.getByText(/Last Login Date:/i)).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/i)).not.toBeInTheDocument();
    });

    it('allows editing user profile information', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane.doe@example.com');

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it.skip('handles image upload', async () => {
        setup();
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-picture.jpg' }),
        });

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-picture.jpg',
        });
    });

    it('handles image upload error', async () => {
        setup();
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        mockFetch.mockRejectedValueOnce(new Error('Failed to upload image'));

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('deletes user profile', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        setup();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        await userEvent.click(deleteButton);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('handles user profile deletion error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to delete user'));

        setup();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setTime(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago

        setup({
            ...mockUserProfile,
            registrationDate: recentRegistrationDate.toISOString(),
        });

        expect(screen.getByRole('button', { name: 'Delete User' })).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setTime(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago

        setup({
            ...mockUserProfile,
            registrationDate: oldRegistrationDate.toISOString(),
        });

        expect(screen.getByRole('button', { name: 'Delete User' })).toBeEnabled();
    });

    it('shows snackbar on successful user edit', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('shows snackbar on failed image upload', async () => {
        setup();
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        mockFetch.mockRejectedValueOnce(new Error('Failed to upload image'));

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('shows snackbar on failed user deletion', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to delete user'));

        setup();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('closes snackbar when close button is clicked', async () => {
        setup();
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        mockFetch.mockRejectedValueOnce(new Error('Failed to upload image'));

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        const closeSnackbarButton = screen.getByRole('button', { name: 'close' });
        await userEvent.click(closeSnackbarButton);

        expect(screen.queryByText('Failed to upload image')).not.toBeInTheDocument();
    });

    it('does not render edit and delete buttons for other users', () => {
        setup(mockUserProfile, {
            id: '2',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'password',
        });

        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete User' })).not.toBeInTheDocument();
    });
});
