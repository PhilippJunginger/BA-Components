import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promises
- fireEvent


- 5 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: 0
Testumfang: 80
 */

describe('UserProfileCardLeicht', () => {
    const userProfile: UserProfile = {
        id: 'user123',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const currentUser: UserWithId = {
        id: 'user123',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'securepassword',
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it('toggles the expanded state when the expand button is clicked', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(
            screen.queryByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(
            screen.getByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
    });

    it('renders edit and save buttons for the current user', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete User')).toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile when changes are saved', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        const newName = 'Jane Doe';
        const newEmail = 'janedoe@example.com';

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, newName);
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, newEmail);

        await userEvent.click(screen.getByText('Save'));
        expect(mockSetUserProfile).toHaveBeenCalledWith({ ...userProfile, name: newName, email: newEmail });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('calls setUserProfile with undefined when the delete user button is clicked', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('shows snackbar after user edit', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        const newName = 'Jane Doe';
        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, newName);

        await userEvent.click(screen.getByText('Save'));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        act(() => jest.runAllTimers());
        expect(screen.queryByText('User edited successfully')).toBeNull();
    });

    it('disables the delete button for recently registered users', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );
        expect(screen.getByText('Delete User')).toBeDisabled();
    });
});
