import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*


- setup
- variable - 1
- unused import
- typeerror - 5

- 8 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: 0
CleanCode: -40
Testumfang: 75
 */

// Mock fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ profileImageUrl: 'newImageUrl' }),
    }),
) as jest.Mock;

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

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('toggles edit mode when Edit button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it('updates user profile when Save button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
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

    it('expands additional information when ExpandMoreIcon is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByLabelText('show more'));

        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
    });

    it('handles image upload correctly', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));
        });
    });

    it('shows error message when image upload fails', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;

        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('disables Delete User button when user is registered for less than 24 hours', () => {
        const recentUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={recentUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it('enables Delete User button when user is registered for more than 24 hours', () => {
        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01',
        };

        render(
            <UserProfileCardMittel
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).not.toBeDisabled();
    });

    it.skip('calls API to delete user when Delete User button is clicked', async () => {
        const user = userEvent.setup();
        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01',
        };

        render(
            <UserProfileCardMittel
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', expect.any(Object));
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('shows error message when user deletion fails', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;

        const user = userEvent.setup();
        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01',
        };

        render(
            <UserProfileCardMittel
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
