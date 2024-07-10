import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- promises
- setup

- variable - 2
- unused import

- 5 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 80
 */

describe('UserProfileCardLeicht', () => {
    const user: UserWithId = {
        id: 'user1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
    };

    const userProfile: UserProfile = {
        id: 'user1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    it.skip('toggles edit mode', async () => {
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({ ...userProfile });
    });

    it('edits user profile', async () => {
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'janedoe@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'janedoe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(userProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument(); // Should be hidden
    });

    it('deletes user if not recently registered', async () => {
        const oldUserProfile: UserProfile = { ...userProfile, registrationDate: new Date(0) }; // Very old registration date
        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={user}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();

        await userEvent.click(deleteButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('disables delete button for recently registered users', () => {
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('hides edit/delete buttons if not current user', () => {
        const differentUser: UserWithId = { ...user, id: 'user2' };
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={differentUser}
            />,
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });
});
