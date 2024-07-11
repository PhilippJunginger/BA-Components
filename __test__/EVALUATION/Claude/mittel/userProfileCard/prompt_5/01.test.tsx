import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- promises
- fireEvent
- waitFor
- setup

- variable - 2
- typeerror - 3
- date creation

- 5 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -40
CleanCode: -30
Testumfang: 43,75
 */

// Mock the fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ profileImageUrl: 'http://example.com/new-image.jpg' }),
    }),
) as jest.Mock;

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
    registrationDate: '2023-05-01T00:00:00.000Z',
    lastLoginDate: '2023-05-15T00:00:00.000Z',
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

    test('toggles expanded view when expand icon is clicked', async () => {
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
            expect(
                screen.getByText(
                    `Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`,
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
            ).toBeInTheDocument();
        });

        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(
                screen.queryByText(
                    `Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`,
                ),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
            ).not.toBeInTheDocument();
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
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'http://example.com/new-image.jpg',
        });
    });

    test('shows error message when image upload fails', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;

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
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    test.skip('handles user deletion', async () => {
        const recentDate = new Date();
        const recentUserProfile = { ...mockUserProfile, registrationDate: recentDate.toISOString() };

        render(
            <UserProfileCardMittel
                userProfile={recentUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();

        fireEvent.click(deleteButton);

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', expect.any(Object));
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    test.skip('disables delete button for users registered more than a day ago', () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 2);
        const oldUserProfile = { ...mockUserProfile, registrationDate: oldDate.toISOString() };

        render(
            <UserProfileCardMittel
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    test('does not show edit and delete buttons for non-current user profiles', () => {
        const nonCurrentUser: UserWithId = { ...mockCurrentUser, id: '2' };

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
});
