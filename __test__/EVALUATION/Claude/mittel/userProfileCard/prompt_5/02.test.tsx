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
- typeerror -
- date creation

- 7 von 8 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -40
CleanCode: -20
Testumfang: 62,5
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

    it.skip('toggles expanded view when clicking expand button', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();

        fireEvent.click(expandButton);

        expect(
            screen.queryByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it('enters edit mode and updates user profile', async () => {
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
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane@example.com',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('handles image upload correctly', async () => {
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
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        Object.defineProperty(fileInput, 'files', {
            value: [file],
        });
        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));
        });
    });

    it('displays error message for large image files', async () => {
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
        const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.png', { type: 'image/png' });
        Object.defineProperty(fileInput, 'files', {
            value: [largeFile],
        });
        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    it.skip('handles user deletion correctly', async () => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-05-01T12:00:00.000Z').valueOf());

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
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

    it.skip('disables delete button after 24 hours', () => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-05-03T00:00:00.000Z').valueOf());

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('does not show edit and delete buttons for non-current user', () => {
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

    it('handles network errors during image upload', async () => {
        global.fetch = jest.fn(() => Promise.reject('Network error')) as jest.Mock;

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
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        Object.defineProperty(fileInput, 'files', {
            value: [file],
        });
        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('handles network errors during user deletion', async () => {
        global.fetch = jest.fn(() => Promise.reject('Network error')) as jest.Mock;

        jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-05-01T12:00:00.000Z').valueOf());

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
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

    it.skip('closes snackbar when close button is clicked', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText('close');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
