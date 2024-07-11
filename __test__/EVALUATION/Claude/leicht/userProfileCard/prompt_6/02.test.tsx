import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*

- variable - 1
- unnecessary waitFOr - 2
- render FUnktion
- setup

- 3 von 5 notwendigem Testumfang erreicht + 6 Redundanz

Best-Practices: 0
CleanCode: -25
Testumfang: 0
 */

describe('UserProfileCardLeicht', () => {
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
        return render(
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
        const user = userEvent.setup();

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

    it('allows editing when Edit button is clicked', async () => {
        renderComponent();
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        expect(screen.getByLabelText('Name')).toHaveValue(mockUserProfile.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockUserProfile.email);
    });

    it('saves edited information when Save button is clicked', async () => {
        renderComponent();
        const user = userEvent.setup();

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

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it.skip('disables Delete User button when user is registered for more than 24 hours', () => {
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        };
        renderComponent(oldUserProfile);

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it.skip('enables Delete User button when user is registered for less than 24 hours', () => {
        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };
        renderComponent(newUserProfile);

        expect(screen.getByText('Delete User')).toBeEnabled();
    });

    it.skip('calls setUserProfile with undefined when Delete User is clicked', async () => {
        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };
        renderComponent(newUserProfile);
        const user = userEvent.setup();

        await user.click(screen.getByText('Delete User'));

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('does not show edit and delete buttons for non-current user profiles', () => {
        const differentUser: UserWithId = {
            ...mockCurrentUser,
            id: '2',
        };
        renderComponent(mockUserProfile, differentUser);

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('closes snackbar when close button is clicked', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByText('Edit'));
        await user.clear(screen.getByLabelText('Name'));
        await user.type(screen.getByLabelText('Name'), 'New Name');
        await user.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        await user.click(screen.getByLabelText('close'));

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
