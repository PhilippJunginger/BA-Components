import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- promises

- unused import
- typeerror - 1
- variable - 1
- unnecessary waitFor


- 1 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 6,25
 */

// Mock fetch to control API responses in tests
global.fetch = jest.fn();

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    profileImageUrl: 'https://example.com/avatar.jpg',
    registrationDate: '2023-01-01',
    lastLoginDate: '2023-07-01',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip('renders user profile information correctly', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete User' })).toBeDisabled(); // Initially disabled
    });

    it('toggles edit mode and saves changes', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-avatar.jpg' }),
        });

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const imageInput = screen.getByLabelText('Change Profile Picture');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'janedoe@example.com');

        const file = new File(['(mocked image)'], 'new-avatar.jpg', { type: 'image/jpeg' });
        await userEvent.upload(imageInput, file); // Simulate file upload

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'janedoe@example.com',
                profileImageUrl: 'https://example.com/new-avatar.jpg', // Updated image URL
            });
        });
    });

    // ... (Add more tests for expanded view, image upload errors, delete user, etc.)
});
