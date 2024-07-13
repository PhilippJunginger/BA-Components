import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*

- type error - 2
- unnecessary waitFor - 3
- variable
- setup

- 7 von 9 notwendigem Testumfang erreicht + 6 Redundanz

Best-Practices: 0
CleanCode: -35
Testumfang: 44,4
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: '2023-01-01',
    lastLoginDate: '2023-06-01',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('toggles edit mode when edit button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        await user.click(screen.getByText('Save'));
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    });

    it('updates user profile when changes are saved', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));
        await user.clear(screen.getByLabelText('Name'));
        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
    });

    it('expands and collapses additional information', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByLabelText('show more'));
        expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await user.click(screen.getByLabelText('show more'));
        expect(screen.queryByText('Show Profile Page')).not.toBeInTheDocument();
    });

    it('navigates to profile page when button is clicked', async () => {
        const user = userEvent.setup();
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByLabelText('show more'));
        await user.click(screen.getByText('Show Profile Page'));

        expect(mockPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
    });

    it('shows delete button for current user profile', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeInTheDocument();
    });

    it('does not show delete button for other user profiles', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={{ ...mockCurrentUser, id: '2' }}
            />,
        );

        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('confirms before deleting user', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', expect.any(Object));
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('shows error message when delete fails', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Delete failed'));

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });

    it('handles image upload correctly', async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-image.jpg' }),
        });

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'image.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));
        });
    });

    it('shows error message when image upload fails', async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Upload failed'));

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'image.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('disables delete button if user registered less than 24 hours ago', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardSchwer
                userProfile={recentUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });
});
