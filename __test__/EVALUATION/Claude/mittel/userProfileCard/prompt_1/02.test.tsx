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
- typeerror - 3
- unnecessary waitFor - 2

- 6 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -40
CleanCode: -30
Testumfang: 56,25
 */

// Mock fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ profileImageUrl: 'new-image-url' }),
    }),
) as jest.Mock;

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
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

    test('renders user profile information correctly', () => {
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

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    test('handles image upload', async () => {
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
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));
        });
    });

    test('shows error message for large image file', async () => {
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
        const largeFile = new File(['a'.repeat(2 * 1024 * 1024)], 'large-image.png', { type: 'image/png' });
        await userEvent.upload(fileInput, largeFile);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    test.skip('handles delete user functionality', async () => {
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
        expect(deleteButton).not.toBeDisabled();

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', expect.any(Object));
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    test.skip('disables delete button for users registered more than 24 hours ago', () => {
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

    test('does not show edit and delete buttons for non-current user', () => {
        const nonCurrentUser: UserWithId = {
            ...mockCurrentUser,
            id: '2',
        };

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={nonCurrentUser}
            />,
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    test('handles fetch errors', async () => {
        global.fetch = jest.fn(() => Promise.reject('API is down')) as jest.Mock;

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

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
