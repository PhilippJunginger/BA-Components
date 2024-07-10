import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup

- unused import
- variable

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -10
Testumfang: 62,5
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly in non-edit mode', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('switches to edit mode and back correctly', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it('updates user profile when saving in edit mode', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'New Name');

        const emailInput = screen.getByRole('textbox', { name: 'Email' });
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'newemail@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'New Name',
            email: 'newemail@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument(); // Snackbar message
    });

    it('deletes user profile correctly', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000) }} // Make user deletable (older than 24 hours)
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    // ... Add more tests for expanded details, snackbar behavior, etc.
});
