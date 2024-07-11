import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*


- setup
- variable - 1
- unnecessary waitFor - 3
- typeerror - 4

- 7 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: 0
CleanCode: -45
Testumfang: 68,75
 */

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ profileImageUrl: 'new-image-url' }),
    }),
) as jest.Mock;

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'profile-image-url',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-05-01T00:00:00.000Z',
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

    it('toggles edit mode when edit button is clicked', async () => {
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

        await user.click(screen.getByText('Save'));

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
        expect(screen.queryByText('Change Profile Picture')).not.toBeInTheDocument();
    });

    it('updates user profile when save button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        await user.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });
    });

    it('expands additional information when expand button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByLabelText('show more'));

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
    });

    it('handles image upload', async () => {
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
            expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));
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

    it.skip('disables delete button when user is registered for more than a day', () => {
        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01T00:00:00.000Z',
        };

        render(
            <UserProfileCardMittel
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it.skip('enables delete button when user is registered for less than a day', () => {
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeEnabled();
    });

    it.skip('calls API to delete user when delete button is clicked', async () => {
        const user = userEvent.setup();
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: newUser.id }),
        });

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('shows error message when user deletion fails', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;

        const user = userEvent.setup();
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUser}
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
