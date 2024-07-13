import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- interface usage
- userEvent
- fireEvent
- node access

- variable - 6
- unused import
- typeerror - 5
- props spreading
- render Funktion

- 9 von 9 notwendigem Testumfang erreicht + 5 Redundanz

Best-Practices: -50
CleanCode: -70
Testumfang: 72,15
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

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

const mockRouterPush = jest.fn();

const setup = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    const props: any = {
        userProfile: userProfile || mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: currentUser || mockCurrentUser,
    };

    render(<UserProfileCardSchwer {...props} />);
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
    });

    it('renders user profile information correctly', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it.skip('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 3/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 3/16/2023')).toBeVisible();

        fireEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 3/15/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 3/16/2023')).not.toBeVisible();
    });

    it.skip('navigates to the profile page', async () => {
        setup();
        const profilePageButton = screen.getByText('Show Profile Page');
        fireEvent.click(profilePageButton);
        expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    describe('Edit Mode', () => {
        it('toggles edit mode', () => {
            setup();
            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);
            expect(screen.getByLabelText('Name')).toBeVisible();
            expect(screen.getByLabelText('Email')).toBeVisible();
            expect(screen.getByText('Change Profile Picture')).toBeVisible();
        });

        it('updates user information', () => {
            setup();
            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            const nameInput = screen.getByLabelText('Name');
            const emailInput = screen.getByLabelText('Email');
            fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
            fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });

            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);

            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        it.skip('uploads a new profile image', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
            });

            setup();
            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
            const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
            fireEvent.change(fileInput, { target: { files: [file] } });

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
                method: 'POST',
                body: expect.any(FormData),
            });

            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);

            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'https://example.com/new-profile-image.jpg',
            });
        });

        it.skip('shows an error message if image upload fails', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Failed to upload image'));

            setup();
            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
            const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
            fireEvent.change(fileInput, { target: { files: [file] } });

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
                method: 'POST',
                body: expect.any(FormData),
            });

            expect(screen.getByText('Failed to upload image')).toBeVisible();
        });
    });

    describe('Delete User', () => {
        it.skip('deletes the user', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
            });
            setup();
            const deleteButton = screen.getByText('Delete User');
            fireEvent.click(deleteButton);
            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
                method: 'POST',
                body: JSON.stringify({ userId: '1' }),
            });
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        it.skip('shows an error message if user deletion fails', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Failed to delete user'));
            setup();
            const deleteButton = screen.getByText('Delete User');
            fireEvent.click(deleteButton);
            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
                method: 'POST',
                body: JSON.stringify({ userId: '1' }),
            });
            expect(screen.getByText('Failed to delete user')).toBeVisible();
        });
    });

    describe('Snackbar', () => {
        it.skip('shows and hides the snackbar', async () => {
            setup();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();

            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            const nameInput = screen.getByLabelText('Name');
            fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);

            expect(screen.getByText('User edited successfully')).toBeVisible();

            const closeSnackbarButton = screen.getByLabelText('close');
            fireEvent.click(closeSnackbarButton);

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Conditional Rendering', () => {
        it('renders edit and delete buttons for the current user', () => {
            setup();
            expect(screen.getByText('Edit')).toBeVisible();
            expect(screen.getByText('Delete User')).toBeVisible();
        });

        it('does not render edit and delete buttons for other users', () => {
            const otherUser: UserWithId = {
                id: '2',
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                password: 'password',
            };
            setup(mockUserProfile, otherUser);
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
            expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
        });

        it('disables the delete button if the user is less than 24 hours old', () => {
            const recentRegistrationDate = new Date();
            recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 12);

            const userProfileWithRecentRegistrationDate: UserProfile = {
                ...mockUserProfile,
                registrationDate: recentRegistrationDate.toISOString(),
            };

            setup(userProfileWithRecentRegistrationDate);
            expect(screen.getByText('Delete User')).toBeDisabled();
        });

        it('enables the delete button if the user is more than 24 hours old', () => {
            const oldRegistrationDate = new Date();
            oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);

            const userProfileWithOldRegistrationDate: UserProfile = {
                ...mockUserProfile,
                registrationDate: oldRegistrationDate.toISOString(),
            };

            setup(userProfileWithOldRegistrationDate);
            expect(screen.getByText('Delete User')).toBeEnabled();
        });
    });
});
