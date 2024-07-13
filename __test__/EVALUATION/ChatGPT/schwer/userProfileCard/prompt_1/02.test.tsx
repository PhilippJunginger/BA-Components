import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promise

- variable - 4
- typeerror - 4
- unused import
- unnecessary waitFor - 2

- 4 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -55
Testumfang: 27,75
 */

// Mock the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = useRouter as jest.Mock;

describe('UserProfileCardSchwer', () => {
    const currentUser: UserWithId = {
        id: '1',
        name: 'Current User',
        email: 'current@example.com',
        password: 'password',
    };

    const userProfile: UserProfile = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        profileImageUrl: 'test.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const setUserProfile = jest.fn();

    beforeEach(() => {
        mockRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders the component', () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'test.jpg');
    });

    it.skip('toggles edit mode', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();

        await userEvent.click(screen.getByText('Save'));
        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            profileImageUrl: 'test.jpg',
        });
    });

    it('handles image upload', async () => {
        const mockFetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'new-test.jpg' }),
            }),
        );
        global.fetch = mockFetch;

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => expect(mockFetch).toHaveBeenCalled());

        await userEvent.click(screen.getByText('Save'));
        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            profileImageUrl: 'new-test.jpg',
        });
    });

    it('handles profile page navigation', async () => {
        const push = jest.fn();
        mockRouter.mockReturnValue({ push });

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByLabelText('show more'));
        await userEvent.click(screen.getByText('Show Profile Page'));

        await waitFor(() => expect(push).toHaveBeenCalledWith('http://localhost:3000/user?id=1'));
    });

    it.skip('handles snackbar close', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText('close'));
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it.skip('handles delete user', async () => {
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

        const mockFetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        );
        global.fetch = mockFetch;

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));

        confirmSpy.mockRestore();
    });

    it('prevents delete if user is less than a day old', () => {
        const recentUserProfile = { ...userProfile, registrationDate: new Date().toISOString() };
        render(
            <UserProfileCardSchwer
                userProfile={recentUserProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });
});
