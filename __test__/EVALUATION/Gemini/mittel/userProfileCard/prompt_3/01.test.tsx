import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- interface usage
- setup
- node access

- variable - 5
- typeerror - 3
- props spreading
- unused import



- 8 von 8 notwendigem Testumfang erreicht + 5 Redundanz

Best-Practices: -30
CleanCode: -50
Testumfang: 68,75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const defaultProps: any = {
    userProfile: mockUserProfile,
    setUserProfile: mockSetUserProfile,
    currentUser: mockCurrentUser,
};

global.fetch = jest.fn();

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-picture.jpg',
        );
    });

    it.skip('expands and collapses additional information', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date: 2023-03-15')).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 2023-03-15')).toBeVisible();
        expect(screen.getByText('Last Login Date: 2023-03-16')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 2023-03-15')).not.toBeVisible();
    });

    it('toggles edit mode and displays edit fields', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it('updates edited user information', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane.doe@example.com');
    });

    it('saves edited user information', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
        });
    });

    it('shows snackbar message after successful user edit', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.click(screen.getByText('Save'));

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('uploads new profile image', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-picture.jpg' }),
        });

        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File('profile-picture.jpg', 'profile-picture.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput as HTMLInputElement, file);

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-picture.jpg',
        });
    });

    it.skip('shows snackbar message if image upload fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to upload image'));

        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File('profile-picture.jpg', 'profile-picture.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput as HTMLInputElement, file);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it.skip('shows snackbar message if image is too large', async () => {
        const file = new File([''], 'profile-picture.jpg', { type: 'image/jpeg' });
        Object.defineProperty(file, 'size', { value: 1048577 });

        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        await userEvent.upload(fileInput as HTMLInputElement, file);

        expect(screen.getByText('File size should be less than 1MB')).toBeVisible();
    });

    it('deletes user', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        render(<UserProfileCardMittel {...defaultProps} />);

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('shows snackbar message if user deletion fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to delete user'));

        render(<UserProfileCardMittel {...defaultProps} />);

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('disables delete button if user registration is less than 24 hours old', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 12);

        render(
            <UserProfileCardMittel
                {...defaultProps}
                userProfile={{ ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() }}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button if user registration is more than 24 hours old', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);

        render(
            <UserProfileCardMittel
                {...defaultProps}
                userProfile={{ ...mockUserProfile, registrationDate: oldRegistrationDate.toISOString() }}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();
    });

    it('closes snackbar', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.click(screen.getByText('Save'));

        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
