import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import userEvent from '@testing-library/user-event';

/*
- setup
- promises

- unused import
- typeerror - 1
- variable - 1
- unnecessary waitFor - 2


- 2 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 18,75
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe('UserProfileCardMittel', () => {
    const user: UserWithId = {
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const userProfile: UserProfile = {
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/avatar.jpg',
        registrationDate: '2024-01-01',
        lastLoginDate: '2024-07-11',
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            userProfile.profileImageUrl,
        );
    });

    it.skip('toggles expanded view when clicking the expand button', async () => {
        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument();

        await userEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.getByText('Registration Date:')).toBeInTheDocument();
        });
    });

    it('toggles edit mode and updates user profile', async () => {
        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });
    });

    // additional test cases can be included below (e.g. for image uploads, deleting a user, etc.)
});
