import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- fireEvent
- setup

- variable - 4
- typeerror - 1
- unnecessary waitFor - 1

- 4 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 33,3
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserProfileCardSchwer Component', () => {
    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'http://example.com/profile.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with user profile data', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'http://example.com/profile.jpg');
    });

    it('should toggle edit mode and save changes', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should handle image upload', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ profileImageUrl: 'http://example.com/new-profile.jpg' }),
            }),
        ) as jest.Mock;

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByText('Edit'));

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'http://example.com/new-profile.jpg',
            });
        });
    });

    it.skip('should navigate to profile page', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByText('Show Profile Page'));

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
        });
    });

    it.skip('should handle delete user', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            }),
        ) as jest.Mock;

        window.confirm = jest.fn(() => true);

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('should handle snackbar close', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByText('Edit'));
        fireEvent.click(screen.getByText('Save'));

        fireEvent.click(screen.getByLabelText('close'));

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
