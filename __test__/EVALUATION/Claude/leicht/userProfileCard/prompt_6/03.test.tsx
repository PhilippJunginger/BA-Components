import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*

- variable - 1
- unnecessary waitFOr - 1
- render FUnktion

- 3 von 5 notwendigem Testumfang erreicht + 7 Redundanz

Best-Practices: 0
CleanCode: -15
Testumfang: -10
 */

describe('UserProfileCardLeicht', () => {
    const user = userEvent.setup();

    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'http://example.com/profile.jpg',
        registrationDate: new Date('2023-01-01'),
        lastLoginDate: new Date('2023-06-01'),
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
    };

    const mockSetUserProfile = jest.fn();

    const renderComponent = (userProfile = mockUserProfile, currentUser = mockCurrentUser) => {
        render(
            <UserProfileCardLeicht
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

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('toggles expanded view when expand button is clicked', async () => {
        renderComponent();

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${mockUserProfile.lastLoginDate.toLocaleDateString()}`),
        ).toBeInTheDocument();

        await user.click(expandButton);

        expect(
            screen.queryByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it('shows edit and delete buttons for current user profile', () => {
        renderComponent();

        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument();
    });

    it('does not show edit and delete buttons for other user profiles', () => {
        const otherUser: UserWithId = { ...mockCurrentUser, id: '2' };
        renderComponent(mockUserProfile, otherUser);

        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete User' })).not.toBeInTheDocument();
    });

    it('enables edit mode when Edit button is clicked', async () => {
        renderComponent();

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        expect(screen.getByLabelText('Name')).toHaveValue(mockUserProfile.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockUserProfile.email);
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('updates user profile when Save button is clicked after editing', async () => {
        renderComponent();

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(mockSetUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane@example.com',
            }),
        );

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('disables Delete User button within 24 hours of registration', () => {
        const recentUserProfile: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };
        renderComponent(recentUserProfile);

        expect(screen.getByRole('button', { name: 'Delete User' })).toBeDisabled();
    });

    it('enables Delete User button after 24 hours of registration', () => {
        const oldUserProfile: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        };
        renderComponent(oldUserProfile);

        expect(screen.getByRole('button', { name: 'Delete User' })).toBeEnabled();
    });

    it('calls setUserProfile with undefined when Delete User is clicked', async () => {
        const oldUserProfile: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        };
        renderComponent(oldUserProfile);

        await user.click(screen.getByRole('button', { name: 'Delete User' }));

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('closes snackbar when close button is clicked', async () => {
        renderComponent();

        await user.click(screen.getByRole('button', { name: 'Edit' }));
        await user.type(screen.getByLabelText('Name'), 'New Name');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        await user.click(screen.getByLabelText('close'));

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
