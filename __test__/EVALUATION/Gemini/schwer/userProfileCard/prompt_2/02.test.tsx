import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import '@testing-library/jest-dom';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer'; // for extended matchers like toBeInTheDocument

/*
- setup

- variable - 3
- unused import - 3
- typeerror - 2
- unnecessary waitFor - 2

- 3 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -50
Testumfang: 27,75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe('UserProfileCardSchwer', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/avatar.jpg',
        registrationDate: '2023-01-01',
        lastLoginDate: '2023-07-10',
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'securePassword',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the user profile information correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={jest.fn()}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={jest.fn()}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);

        expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();

        await userEvent.click(expandButton); // Collapse

        expect(screen.queryByText('Show Profile Page')).not.toBeInTheDocument();
    });

    it('toggles edit mode and saves changes', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'janedoe@example.com');

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'janedoe@example.com',
            });
        });
    });

    it('uploads a new profile image (successful scenario)', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-avatar.jpg' }),
        });

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={jest.fn()}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File(['(mocked image data)'], 'avatar.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
                method: 'POST',
                body: expect.any(FormData),
            });
        });
    });

    // ... (Add more test cases for image upload failures,
    // profile page navigation, user deletion, snackbar messages, etc.)
});
