import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promises
- fireEvent
- node access

- variable - 3
- typeerror
- unnecessary waitFor - 4

- 5 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -40
Testumfang: 49,95
 */

// Mock the router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

const currentUser: UserWithId = {
    id: '1',
    name: 'Current User',
    email: 'currentuser@example.com',
    password: 'password123',
};

const userProfile: UserProfile = {
    id: '1',
    name: 'User Name',
    email: 'user@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: '2023-01-01T00:00:00Z',
    lastLoginDate: '2023-07-01T00:00:00Z',
};

const setUserProfile = jest.fn();

describe('UserProfileCardSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile information', () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('User Name')).toBeInTheDocument();
        expect(screen.getByText('Email: user@example.com')).toBeInTheDocument();
    });

    test('toggles edit mode and edits user information', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        // Enter edit mode
        await userEvent.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        // Edit user details
        fireEvent.change(nameInput, { target: { value: 'New User Name' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });

        // Save changes
        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New User Name',
                    email: 'newuser@example.com',
                }),
            );
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('uploads profile image', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        // Enter edit mode
        await userEvent.click(screen.getByText('Edit'));

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');

        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    profileImageUrl: expect.any(String),
                }),
            );
        });
    });

    test('navigates to profile page', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByLabelText('show more'));
        await userEvent.click(screen.getByText('Show Profile Page'));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
        });
    });

    test.skip('handles user deletion', async () => {
        window.confirm = jest.fn().mockImplementation(() => true);

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });

        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });

    test.skip('disables delete button based on registration date', () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User').closest('button');
        expect(deleteButton).toBeDisabled();
    });
});
