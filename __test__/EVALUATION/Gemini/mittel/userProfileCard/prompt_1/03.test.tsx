import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- promises
- setup

- variable - 2
- typeerror - 2
- unnecessary waitFOr - 3
- unused import



- 5 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -40
Testumfang: 56,25
 */

// Mock fetch API calls
global.fetch = jest.fn() as jest.Mock;

describe('UserProfileCardMittel Component', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        registrationDate: '2023-01-01',
        lastLoginDate: '2023-01-02',
        profileImageUrl: 'https://example.com/profile.jpg',
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
    };

    const mockSetUserProfile = jest.fn();

    const renderComponent = (userProfile: UserProfile = mockUserProfile, currentUser: UserWithId = mockCurrentUser) => {
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it('expands and shows additional details when "show more" button is clicked', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 1/2/2023')).toBeInTheDocument();
    });

    it('toggles edit mode when "Edit" button is clicked', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it.skip('updates user profile when changes are saved', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'new-image-url' }),
        });

        renderComponent();
        await userEvent.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;

        await userEvent.type(nameInput, 'New Name');
        await userEvent.type(emailInput, 'newemail@example.com');

        // Simulate file upload
        const file = new File(['(mocked file)'], 'profile.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput, file);

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'New Name',
                email: 'newemail@example.com',
                profileImageUrl: 'new-image-url',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('shows error snackbar when image upload fails', async () => {
        fetch.mockRejectedValueOnce(new Error('Upload failed'));

        renderComponent();
        await userEvent.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File(['(mocked file)'], 'profile.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('shows error snackbar when file size is too large', async () => {
        renderComponent();
        await userEvent.click(screen.getByText('Edit'));

        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;

        // Create a large file (over 1MB)
        const largeFile = new File([new ArrayBuffer(1048577)], 'largefile.jpg', {
            type: 'image/jpeg',
        });
        await userEvent.upload(fileInput, largeFile);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    // Add more tests for:
    // - Deleting user
    // - Disabling delete button for recently registered users
    // - ...
});
