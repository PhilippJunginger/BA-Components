import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- waitFor assetions

- setup
- variable -
- typeerror - 4
- unnecessary waitFor - 2

- 7 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -40
Testumfang: 75
 */

// Mock the fetch function
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
    profileImageUrl: 'https://example.com/image.jpg',
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

    it('toggles expanded view when clicking expand button', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await user.click(expandButton);

        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    it('enters edit mode and updates user profile', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane@example.com',
            }),
        );
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

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/api/upload-image',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData),
                }),
            );
        });
    });

    it('shows snackbar message on failed image upload', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('disables delete button within 24 hours of registration', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={recentUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it('enables delete button after 24 hours of registration', () => {
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: '2022-01-01T00:00:00.000Z',
        };

        render(
            <UserProfileCardMittel
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeEnabled();
    });

    it.skip('handles user deletion', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/api/user',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ userId: mockUserProfile.id }),
                }),
            );
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('shows snackbar message on failed user deletion', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
