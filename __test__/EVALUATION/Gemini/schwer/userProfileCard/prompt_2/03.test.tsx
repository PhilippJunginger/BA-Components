import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- fireEvent

- variable - 3
- typeerror

- 3 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -20
Testumfang: 27,75
 */

const user = userEvent.setup();

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
}));

const mockUserProfile: UserProfile = {
    id: '123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/avatar.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
};

const mockSetUserProfile = jest.fn();

global.fetch = jest.fn() as jest.Mock; // Mocking fetch for API calls

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile details correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    });

    it('toggles edit mode and saves changes', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Toggle edit mode
        await user.click(screen.getByRole('button', { name: 'Edit' }));
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

        // Change name and email
        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        const emailInput = screen.getByLabelText('Email');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        // Save changes
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it.skip('expands to show more details', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Expand
        await user.click(screen.getByRole('button', { name: 'show more' }));

        expect(screen.getByText('Registration Date:')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date:')).toBeInTheDocument();
    });

    it.skip('handles image upload successfully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-avatar.jpg' }),
        });

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Toggle edit mode
        await user.click(screen.getByRole('button', { name: 'Edit' }));

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(mocked image data)'], 'avatar.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'https://example.com/new-avatar.jpg',
            });
        });
    });

    // ... (Add more tests for other functionalities and edge cases)
});
