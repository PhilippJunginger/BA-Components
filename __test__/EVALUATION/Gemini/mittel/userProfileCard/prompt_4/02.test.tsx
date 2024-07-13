import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardMedia } from '@mui/material';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- interface usage
- setup

- variable - 4
- typeerror
- render Funktion
- props spreading
- unused import - 2



- 7 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -45
Testumfang: 81,25
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
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

const mockFetch = jest.fn();
global.fetch = mockFetch;

const renderComponent = (props?: any) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: mockCurrentUser,
    };

    return render(<UserProfileCardMittel {...defaultProps} {...props} />);
};

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        renderComponent();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it.skip('expands and collapses additional information', async () => {
        renderComponent();

        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 03/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 03/16/2023')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();
    });

    it('enables edit mode and updates user profile', async () => {
        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });
        const saveButton = screen.getByRole('button', { name: 'Save' });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it('uploads new profile image', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
        });

        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-image.jpg',
        });
    });

    it('shows error message when image upload fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to upload image'));

        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('deletes user profile', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

        renderComponent();

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('shows error message when user deletion fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to delete user'));

        renderComponent();

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setTime(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago

        renderComponent({
            userProfile: { ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() },
        });

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });
});
