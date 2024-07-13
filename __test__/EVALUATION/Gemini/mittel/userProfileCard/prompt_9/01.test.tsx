import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- promises
- usage of interface

- unused import
- typeerror - 1
- variable - 2
- render Funktion


- 2 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -25
Testumfang: 18,75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: '[email address removed]',
    profileImageUrl: '[invalid URL removed]',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: '[email address removed]',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

const renderComponent = (props: any = {}) => {
    return render(
        <UserProfileCardMittel
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
            {...props}
        />,
    );
};

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn() as jest.Mock; // Mock fetch for API calls
    });

    it('renders user profile information correctly', () => {
        renderComponent();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: [email address removed]')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument();
    });

    it.skip('toggles edit mode and updates user profile', async () => {
        renderComponent();

        // Enter edit mode
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

        // Edit user information
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, '[email address removed]');

        // Save changes
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: '[email address removed]',
            });
        });

        // Snackbar message should appear
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('expands/collapses additional details', async () => {
        renderComponent();

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    // Add more tests for image upload, user deletion, snackbar behavior, etc.
});
