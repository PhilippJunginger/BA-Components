import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- usage of interface
- fireEVemt
- waitFor
- promise
- setup

- variable
- typeerror - 5


- 3 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -50
CleanCode: -30
Testumfang: 56,25
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe('UserProfileCardMittel Component', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const mockUserWithId: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password',
    };

    const mockSetUserProfile = jest.fn();

    const defaultProps: any = {
        userProfile: mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: mockUserWithId,
    };

    it('renders user profile information correctly', () => {
        render(<UserProfileCardMittel {...defaultProps} />);
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);
        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
            expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
        });
        await userEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
        });
    });

    it('toggles edit mode and updates user profile', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        // Mock image upload
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
        });
        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(mocked file)'], 'new-profile.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput, file);

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                profileImageUrl: 'https://example.com/new-profile.jpg',
            });
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it.skip('deletes user profile', async () => {
        fetch.mockResolvedValueOnce({ ok: true });
        render(<UserProfileCardMittel {...defaultProps} />);
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled(); // Initially disabled

        // Mock registration date to allow deletion
        const recentRegistrationDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
        render(
            <UserProfileCardMittel
                {...defaultProps}
                userProfile={{ ...mockUserProfile, registrationDate: recentRegistrationDate }}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Delete User' }));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('shows error messages on image upload failure', async () => {
        // Mock image upload failure
        fetch.mockRejectedValueOnce(new Error('Upload failed'));

        render(<UserProfileCardMittel {...defaultProps} />);
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(mocked file)'], 'profile.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('shows error message on user deletion failure', async () => {
        // Mock user deletion failure
        fetch.mockRejectedValueOnce(new Error('Delete failed'));
        const recentRegistrationDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
        render(
            <UserProfileCardMittel
                {...defaultProps}
                userProfile={{ ...mockUserProfile, registrationDate: recentRegistrationDate }}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Delete User' }));

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
