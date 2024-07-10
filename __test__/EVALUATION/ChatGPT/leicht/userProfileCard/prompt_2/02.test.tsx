import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*

- unused import - 2
- setup
- variable - 2

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: 0
CleanCode: -10
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastLoginDate: new Date(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component with user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /user profile image/i })).toHaveAttribute(
            'src',
            'https://example.com/profile.jpg',
        );
    });

    it('toggles edit mode and saves edited user profile', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Enter edit mode
        await user.click(screen.getByText('Edit'));
        expect(screen.getByLabelText('Name')).toBeInTheDocument();

        // Change user name
        await user.clear(screen.getByLabelText('Name'));
        await user.type(screen.getByLabelText('Name'), 'Jane Doe');

        // Save changes
        await user.click(screen.getByText('Save'));
        expect(mockSetUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('expands and collapses the user details', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Expand details
        await user.click(screen.getByLabelText('show more'));
        expect(screen.getByText(/registration date:/i)).toBeInTheDocument();

        // Collapse details
        await user.click(screen.getByLabelText('show more'));
        expect(screen.queryByText(/registration date:/i)).not.toBeInTheDocument();
    });

    it.skip('deletes the user profile if delete button is clicked and less than a day old', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: new Date() }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('disables the delete button if user profile is older than a day', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it.skip('closes the snackbar when close button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Simulate edit mode and saving
        await user.click(screen.getByText('Edit'));
        await user.click(screen.getByText('Save'));

        // Close snackbar
        await user.click(screen.getByLabelText('close'));
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
