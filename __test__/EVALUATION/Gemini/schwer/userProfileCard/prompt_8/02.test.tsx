import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- node access

- variable - 2
- typeerror - 3
- render Funktion

- 6 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 55,5
 */

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-04-01T12:00:00.000Z',
    lastLoginDate: '2023-04-07T12:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const setup = () => {
    render(
        <UserProfileCardSchwer
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
        />,
    );
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information', () => {
        setup();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText('Show Profile Page')).not.toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText('Show Profile Page')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Show Profile Page')).not.toBeVisible();
    });

    it('toggles edit mode and saves changes', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        // Enter edit mode
        await userEvent.click(editButton);
        expect(editButton).toHaveTextContent('Save');

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        // Save changes
        await userEvent.click(editButton);
        expect(editButton).toHaveTextContent('Edit');
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it('uploads a new profile image', async () => {
        setup();
        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
        const mockFile = new File([''], 'profile-image.jpg', { type: 'image/jpeg' });

        // Mock fetch API call
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
        });

        // Upload image
        await userEvent.upload(fileInput, mockFile);

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-image.jpg',
        });
    });

    it('deletes the user after confirmation', async () => {
        setup();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        // Mock confirmation dialog
        window.confirm = jest.fn().mockReturnValue(true);

        // Mock fetch API call
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
        });

        // Delete user
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: mockUserProfile.id }),
        });
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('shows a snackbar message on successful user edit', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        // Enter edit mode
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        // Save changes
        await userEvent.click(editButton);
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('shows a snackbar message on failed image upload', async () => {
        setup();
        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
        const mockFile = new File([''], 'profile-image.jpg', { type: 'image/jpeg' });

        // Mock fetch API call to throw an error
        global.fetch = jest.fn().mockRejectedValue(new Error('Failed to upload image'));

        // Upload image
        await userEvent.upload(fileInput, mockFile);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('shows a snackbar message on failed user deletion', async () => {
        setup();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        // Mock confirmation dialog
        window.confirm = jest.fn().mockReturnValue(true);

        // Mock fetch API call to throw an error
        global.fetch = jest.fn().mockRejectedValue(new Error('Failed to delete user'));

        // Delete user
        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });
});
