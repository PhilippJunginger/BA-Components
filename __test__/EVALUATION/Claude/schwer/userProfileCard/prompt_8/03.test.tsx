import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*


- setup
- type error - 5
- unnecessary waitFor - 3
- variable - 6
- render Funktion

- 6 von 9 notwendigem Testumfang erreicht + 6 Redundanz

Best-Practices: 0
CleanCode: -80
Testumfang: 33,3
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ profileImageUrl: 'new-image-url.jpg' }),
    }),
) as jest.Mock;

describe('UserProfileCardSchwer', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'profile.jpg',
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

    const renderComponent = (userProfile = mockUserProfile, currentUser = mockCurrentUser) => {
        return render(
            <UserProfileCardSchwer
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
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'profile.jpg');
    });

    it('toggles expanded view when expand button is clicked', async () => {
        renderComponent();
        const user = userEvent.setup();
        const expandButton = screen.getByLabelText('show more');

        await user.click(expandButton);
        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 6/1/2023')).toBeInTheDocument();

        await user.click(expandButton);
        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
    });

    it('enables edit mode when Edit button is clicked', async () => {
        renderComponent();
        const user = userEvent.setup();
        const editButton = screen.getByText('Edit');

        await user.click(editButton);
        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it('updates user profile when Save button is clicked', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByText('Edit'));
        await user.clear(screen.getByLabelText('Name'));
        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('handles image upload correctly', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/api/upload-image',
                expect.objectContaining({ method: 'POST' }),
            );
        });
    });

    it('shows error message when image upload fails', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('navigates to profile page when Show Profile Page button is clicked', async () => {
        const mockPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
            push: mockPush,
        }));

        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByLabelText('show more'));
        await user.click(screen.getByText('Show Profile Page'));

        expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it.skip('disables Delete User button when user is registered for more than a day', () => {
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: '2022-01-01T00:00:00.000Z',
        };
        renderComponent(oldUserProfile);

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it.skip('enables Delete User button when user is registered for less than a day', () => {
        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };
        renderComponent(newUserProfile);

        expect(screen.getByText('Delete User')).not.toBeDisabled();
    });

    it.skip('deletes user when Delete User button is clicked and confirmed', async () => {
        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };
        renderComponent(newUserProfile);
        const user = userEvent.setup();

        window.confirm = jest.fn(() => true);
        await user.click(screen.getByText('Delete User'));

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(global.fetch).toHaveBeenCalledWith(
            'https://example.com/api/user',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ userId: '1' }),
            }),
        );
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('shows error message when user deletion fails', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;
        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };
        renderComponent(newUserProfile);
        const user = userEvent.setup();

        window.confirm = jest.fn(() => true);
        await user.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });

    it('does not show Edit and Delete buttons for non-current user profiles', () => {
        const differentUser: UserWithId = { ...mockCurrentUser, id: '2' };
        renderComponent(mockUserProfile, differentUser);

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });
});
