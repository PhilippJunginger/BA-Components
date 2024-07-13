import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- fireEvent
- promises

- variable - 3
- typeerror - 1
- unnecessary declaration with let - 2

- 3 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -30
Testumfang: 27,75
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserProfileCardSchwer', () => {
    let userProfile: UserProfile;
    let currentUser: UserWithId;
    let setUserProfile: jest.Mock;
    let mockRouter: any;

    beforeEach(() => {
        userProfile = {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            profileImageUrl: 'https://example.com/avatar.jpg',
            registrationDate: '2023-01-01',
            lastLoginDate: '2023-01-02',
        };

        currentUser = {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password',
        };

        setUserProfile = jest.fn();

        mockRouter = {
            push: jest.fn(),
        };
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Show Profile Page')).toBeNull();
    });

    it('enables edit mode and updates user profile', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        await userEvent.click(screen.getByText('Save'));
        await waitFor(() =>
            expect(setUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                name: 'Jane Doe',
                email: 'jane@example.com',
            }),
        );
    });

    it.skip('uploads a new profile image', async () => {
        const file = new File(['image content'], 'avatar.jpg', { type: 'image/jpeg' });
        const input = screen.getByLabelText('Change Profile Picture');
        fireEvent.change(input, { target: { files: [file] } });

        // Mock fetch for image upload
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-avatar.jpg' }),
        });

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalled();
        });
    });

    // ... more tests for other functionalities (delete user, snackbar, etc.)
});
