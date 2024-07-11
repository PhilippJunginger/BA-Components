import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireEvent
- promises
- watiFor assertions
- setup

- variable - 1
- typeerror - 4

- 6 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -40
CleanCode: -25
Testumfang: 56,25
 */

// Mock fetch
global.fetch = jest.fn();

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-06-01T00:00:00.000Z',
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

    test('renders user profile information', () => {
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

    test('expands and collapses additional information', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
            expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
        });

        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
        });
    });

    test('enters edit mode and updates user profile', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                }),
            );
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test('handles image upload', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-image.jpg' }),
        });

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'image.png', { type: 'image/png' });

        await userEvent.upload(fileInput, file);

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

    test('handles image upload failure', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'image.png', { type: 'image/png' });

        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    test.skip('handles user deletion', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

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

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/api/user',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ userId: recentUser.id }),
                }),
            );
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    test.skip('handles user deletion failure', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Deletion failed'));

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

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });

    test.skip('delete button is disabled for users registered more than a day ago', () => {
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

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    test('edit and delete buttons are not shown for non-current user profiles', () => {
        const differentUser: UserWithId = {
            ...mockCurrentUser,
            id: '2',
        };

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={differentUser}
            />,
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });
});
