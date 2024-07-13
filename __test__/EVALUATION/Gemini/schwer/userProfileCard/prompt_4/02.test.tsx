import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- interface usage
- vitest instead of jest

- variable - 2
- date creation
- unused import
- typeerror - 4
- props spreading

- 9 von 9 notwendigem Testumfang erreicht + 7 Redundanz

Best-Practices: -40
CleanCode: -45
Testumfang: 61,05
 */

vi.mock('next/router', () => ({
    useRouter: vi.fn(),
}));

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-16T10:00:00.000Z',
    lastLoginDate: '2023-03-17T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockUserProfileDifferentId: UserProfile = {
    id: '2',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-16T10:00:00.000Z',
    lastLoginDate: '2023-03-17T10:00:00.000Z',
};

const mockProps: any = {
    userProfile: mockUserProfile,
    setUserProfile: vi.fn(),
    currentUser: mockCurrentUser,
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue({ push: vi.fn() });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render user profile information correctly', () => {
        render(<UserProfileCardSchwer {...mockProps} />);

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('should expand and collapse the card content', async () => {
        render(<UserProfileCardSchwer {...mockProps} />);

        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText(/Registration Date:/i)).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/i)).toBeVisible();
        expect(screen.getByText(new Date(mockUserProfile.registrationDate).toLocaleDateString())).toBeVisible();
        expect(screen.getByText(/Last Login Date:/i)).toBeVisible();
        expect(screen.getByText(new Date(mockUserProfile.lastLoginDate).toLocaleDateString())).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/i)).not.toBeVisible();
    });

    it('should navigate to the profile page on button click', async () => {
        render(<UserProfileCardSchwer {...mockProps} />);

        const showProfileButton = screen.getByRole('button', { name: 'Show Profile Page' });
        await userEvent.click(showProfileButton);

        expect(useRouter().push).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
    });

    it('should toggle edit mode on button click', async () => {
        render(<UserProfileCardSchwer {...mockProps} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
        expect(editButton).toHaveTextContent('Save');

        await userEvent.click(editButton);

        expect(editButton).toHaveTextContent('Edit');
    });

    it('should update user profile on edit and save', async () => {
        render(<UserProfileCardSchwer {...mockProps} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, 'Edited Name');
        await userEvent.type(emailInput, 'edited.email@example.com');

        await userEvent.click(editButton);

        expect(mockProps.setUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Edited Name',
            email: 'edited.email@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should handle image upload', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-image.jpg' }),
        });

        render(<UserProfileCardSchwer {...mockProps} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const imageUploadInput = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(imageUploadInput, file);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        expect(mockProps.setUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-image.jpg',
        });
    });

    it('should handle image upload error', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to upload image'));

        render(<UserProfileCardSchwer {...mockProps} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const imageUploadInput = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(imageUploadInput, file);

        expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
    });

    it('should show snackbar with error message if image upload fails', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to upload image'));

        render(<UserProfileCardSchwer {...mockProps} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('should show snackbar with error message if image size is too large', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        // Mocking a large file size
        Object.defineProperty(file, 'size', { value: 1048577 });

        render(<UserProfileCardSchwer {...mockProps} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        expect(screen.getByText('File size should be less than 1MB')).toBeVisible();
    });

    it('should delete user on button click', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
        });

        render(<UserProfileCardSchwer {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: mockUserProfile.id }),
        });
        expect(mockProps.setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('should handle delete user error', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to delete user'));

        render(<UserProfileCardSchwer {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });

    it('should not delete user if not confirmed', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const mockFetch = vi.spyOn(global, 'fetch');

        render(<UserProfileCardSchwer {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should disable delete button if user registration is less than 24 hours', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 12);

        const userProfileWithRecentRegistration: UserProfile = {
            ...mockUserProfile,
            registrationDate: recentRegistrationDate.toISOString(),
        };

        render(<UserProfileCardSchwer {...mockProps} userProfile={userProfileWithRecentRegistration} />);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button if user registration is more than 24 hours', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setHours(oldRegistrationDate.getHours() - 36);

        const userProfileWithOldRegistration: UserProfile = {
            ...mockUserProfile,
            registrationDate: oldRegistrationDate.toISOString(),
        };

        render(<UserProfileCardSchwer {...mockProps} userProfile={userProfileWithOldRegistration} />);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeEnabled();
    });

    it('should not render edit and delete buttons for other users', () => {
        render(
            <UserProfileCardSchwer
                {...mockProps}
                userProfile={mockUserProfileDifferentId}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete User' })).not.toBeInTheDocument();
    });
});
