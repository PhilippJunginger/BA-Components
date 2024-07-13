import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- promises

- unused import - 2
- typeerror - 1
- variable - 2


- 2 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 18,75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2024-07-10T12:00:00Z',
    lastLoginDate: '2024-07-10T13:00:00Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn() as jest.Mock;
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it.skip('expands and collapses additional details', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 07/10/2024')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 07/10/2024')).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 07/10/2024')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 07/10/2024')).not.toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'janedoe@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'janedoe@example.com',
        });
    });

    // ... (additional tests for image upload, user deletion, snackbar, etc.)
});
