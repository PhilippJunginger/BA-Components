import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- waitFor assertions
- fireEvent

- setup
- variable - 1
- render Funktion

- 3 von 5 notwendigem Testumfang erreicht + 6 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 0
 */

describe('UserProfileCardLeicht', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'http://example.com/profile.jpg',
        registrationDate: new Date('2023-01-01'),
        lastLoginDate: new Date('2023-05-01'),
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

    it('expands and collapses additional information', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');

        fireEvent.click(expandButton);
        await waitFor(() => {
            expect(
                screen.getByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
            ).toBeInTheDocument();
            expect(
                screen.getByText(`Last Login Date: ${mockUserProfile.lastLoginDate.toLocaleDateString()}`),
            ).toBeInTheDocument();
        });

        fireEvent.click(expandButton);
        await waitFor(() => {
            expect(
                screen.queryByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
            ).not.toBeInTheDocument();
        });
    });

    it('shows edit and delete buttons for current user profile', () => {
        renderComponent();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete User')).toBeInTheDocument();
    });

    it('does not show edit and delete buttons for other user profiles', () => {
        const otherUser: UserWithId = { ...mockCurrentUser, id: '2' };
        renderComponent(mockUserProfile, otherUser);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('enters edit mode and updates user profile', async () => {
        const user = userEvent.setup();
        renderComponent();

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
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('disables delete button if user registered more than 24 hours ago', () => {
        const oldUser = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        };
        renderComponent(oldUser);
        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it.skip('enables delete button if user registered less than 24 hours ago', () => {
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };
        renderComponent(newUser);
        expect(screen.getByText('Delete User')).not.toBeDisabled();
    });

    it.skip('calls setUserProfile with undefined when delete button is clicked', async () => {
        const user = userEvent.setup();
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };
        renderComponent(newUser);

        await user.click(screen.getByText('Delete User'));

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('closes snackbar when close button is clicked', async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByText('Edit'));
        await user.type(screen.getByLabelText('Name'), 'New Name');
        await user.click(screen.getByText('Save'));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        await user.click(screen.getByLabelText('close'));

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
