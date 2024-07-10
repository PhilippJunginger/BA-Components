import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promises

- unused import
- variable - 2

- 3 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 40
 */

describe('UserProfileCardLeicht Component', () => {
    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'securePassword',
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

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it.skip('toggles the edit mode', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(mockSetUserProfile).toHaveBeenCalledTimes(1);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
    });

    it.skip('expands and collapses additional details', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date:')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date:')).toBeInTheDocument();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date:')).not.toBeInTheDocument();
    });

    it.skip('handles user deletion', async () => {
        const newUserProfile = { ...userProfile, registrationDate: new Date(Date.now() - 10000) }; // Make user deletable

        render(
            <UserProfileCardLeicht
                userProfile={newUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('shows a snackbar message after editing', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), ' Updated');
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('User edited successfully')).toBeInTheDocument();
    });
});
