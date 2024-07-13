import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- promises
- setup
- interface usage
- waitFor assertions

- unnecessary waitFOr - 1
- unused import
- render Funktion
- props spreading



- 2 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -20
Testumfang: 18,75
 */

// Mock fetch to simulate API calls
global.fetch = jest.fn();

describe('UserProfileCardMittel', () => {
    const mockUserProfile: UserProfile = {
        id: 'user123',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date('2023-01-01'),
        lastLoginDate: new Date('2024-07-01'),
    };
    const mockCurrentUser: UserWithId = {
        id: 'user123',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'securePassword',
    };

    const mockSetUserProfile = jest.fn();

    const setup = (props: any = {}) => {
        const defaultProps = {
            userProfile: mockUserProfile,
            setUserProfile: mockSetUserProfile,
            currentUser: mockCurrentUser,
        };
        const combinedProps = { ...defaultProps, ...props };
        render(<UserProfileCardMittel {...combinedProps} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        setup();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            mockUserProfile.profileImageUrl,
        );
    });

    it('expands and collapses additional details', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });

        // Initially, additional details should be hidden
        expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date:')).not.toBeInTheDocument();

        // Click to expand details
        await userEvent.click(expandButton);
        // Wait for the collapse transition to complete
        await waitFor(() => {
            expect(
                screen.getByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
            ).toBeInTheDocument();
            expect(
                screen.getByText(`Last Login Date: ${mockUserProfile.lastLoginDate.toLocaleDateString()}`),
            ).toBeInTheDocument();
        });

        // Click again to collapse details
        await userEvent.click(expandButton);
        // Wait for the collapse transition to complete
        await waitFor(() => {
            expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument();
            expect(screen.queryByText('Last Login Date:')).not.toBeInTheDocument();
        });
    });

    it('switches to edit mode and back', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    });

    // ... (Tests for editing user details, image upload, snackbar, delete user, etc.)
});
