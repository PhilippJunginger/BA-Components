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

- variable - 3
- typeerror
- unnecessary waitFOr - 3
- unused import



- 3 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -40
Testumfang: 31,25
 */

// Mock fetch API
global.fetch = jest.fn();

describe('UserProfileCardMittel', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: '2023-01-01',
        lastLoginDate: '2023-01-02',
    };
    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
    };

    const mockSetUserProfile = jest.fn();

    const defaultProps: any = {
        userProfile: mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: mockCurrentUser,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile information correctly', () => {
        render(<UserProfileCardMittel {...defaultProps} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    test.skip('expands and collapses additional details', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.getByText('Registration Date: 01/01/2023')).toBeInTheDocument();
            expect(screen.getByText('Last Login Date: 01/02/2023')).toBeInTheDocument();
        });
        await userEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.queryByText('Registration Date: 01/01/2023')).not.toBeInTheDocument();
            expect(screen.queryByText('Last Login Date: 01/02/2023')).not.toBeInTheDocument();
        });
    });

    test('toggles edit mode and updates user profile', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane@example.com',
            });
        });
    });

    test.skip('opens Snackbar after successfull profile update', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    // ... (additional tests for image upload, user deletion, snackbar messages, and error handling)
});
