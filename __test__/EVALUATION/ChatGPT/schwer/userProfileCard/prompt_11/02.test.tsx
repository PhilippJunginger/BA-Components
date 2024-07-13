import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- condition in test
- promises
- node access

- type error
- unnecessary waitFor - 3
- unused import

- 4 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -40
CleanCode: -25
Testumfang: 27,75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = useRouter as jest.Mock;

describe('UserProfileCardSchwer', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'http://example.com/image.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const setUserProfile = jest.fn();

    beforeEach(() => {
        mockRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders user profile information', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it('toggles edit mode', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        await userEvent.click(screen.getByText('Save'));

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it('handles profile page navigation', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByLabelText('show more'));
        await userEvent.click(screen.getByText('Show Profile Page'));

        await waitFor(() => {
            expect(mockRouter().push).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
        });
    });

    it.skip('handles image upload', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture').querySelector('input');

        if (input) {
            await userEvent.upload(input, file);
        }

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalled();
        });
    });

    it.skip('handles delete user', async () => {
        window.confirm = jest.fn().mockImplementation(() => true);

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('shows snackbar message on edit', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('closes snackbar message', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));

        await userEvent.click(screen.getByLabelText('close'));

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
