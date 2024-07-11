import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*

- setup
- variable - 1
- unused import
- unnecessary waitFor - 4
- typeerror - 4

- 8 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: 0
CleanCode: -55
Testumfang: 62,25
 */

// Mock the fetch function
global.fetch = jest.fn();

describe('UserProfileCardMittel', () => {
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

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
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

    it('expands additional information when ExpandMoreIcon is clicked', async () => {
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

        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
    });

    it.skip('disables Delete User button if user registered more than 24 hours ago', () => {
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

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it.skip('enables Delete User button if user registered less than 24 hours ago', () => {
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

        expect(screen.getByText('Delete User')).not.toBeDisabled();
    });

    it.skip('calls delete API when Delete User button is clicked', async () => {
        const user = userEvent.setup();
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        render(
            <UserProfileCardMittel
                userProfile={newUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: newUser.id }),
        });

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('shows error message when delete API fails', async () => {
        const user = userEvent.setup();
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

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

    it('uploads image when a file is selected', async () => {
        const user = userEvent.setup();
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-image.jpg' }),
        });

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const fileInput = screen.getByLabelText('Change Profile Picture');
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));
        });
    });

    it('shows error message when image upload fails', async () => {
        const user = userEvent.setup();
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const fileInput = screen.getByLabelText('Change Profile Picture');
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('shows error message when file size is too large', async () => {
        const user = userEvent.setup();
        const file = new File(['a'.repeat(2 * 1024 * 1024)], 'large.png', { type: 'image/png' });

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const fileInput = screen.getByLabelText('Change Profile Picture');
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });
});
