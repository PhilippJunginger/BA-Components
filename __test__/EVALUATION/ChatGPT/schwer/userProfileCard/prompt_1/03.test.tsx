import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- interface usage
- promise

- variable - 2
- typeerror - 1
- unused import
- unnecessary waitFor - 5
- render Funktion
- props spreading

- 4 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -55
Testumfang: 27,75
 */

// Mock the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
};
(useRouter as jest.Mock).mockReturnValue(mockRouter);

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const setup = (props: any = {}) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: jest.fn(),
        currentUser: mockCurrentUser,
    };
    return render(<UserProfileCardSchwer {...defaultProps} {...props} />);
};

describe('UserProfileCardSchwer', () => {
    it('renders the component with user profile details', () => {
        setup();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('toggles edit mode and updates user profile', async () => {
        const setUserProfileMock = jest.fn();
        setup({ setUserProfile: setUserProfileMock });

        await userEvent.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('handles image upload', async () => {
        const setUserProfileMock = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
            }),
        ) as jest.Mock;

        setup({ setUserProfile: setUserProfileMock });

        await userEvent.click(screen.getByText('Edit'));

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'https://example.com/new-profile.jpg',
            });
        });
    });

    it('handles profile page navigation', async () => {
        setup();

        await userEvent.click(screen.getByLabelText('show more'));
        await userEvent.click(screen.getByText('Show Profile Page'));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
        });
    });

    it.skip('handles snackbar close', async () => {
        setup();

        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));

        await userEvent.click(screen.getByLabelText('close'));

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it.skip('handles user deletion', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;

        const setUserProfileMock = jest.fn();
        setup({ setUserProfile: setUserProfileMock });

        window.confirm = jest.fn(() => true);

        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('prevents user deletion if not confirmed', async () => {
        const setUserProfileMock = jest.fn();
        setup({ setUserProfile: setUserProfileMock });

        window.confirm = jest.fn(() => false);

        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(setUserProfileMock).not.toHaveBeenCalled();
        });
    });

    it.skip('disables delete button for users registered more than a day ago', () => {
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setup({ userProfile: oldUserProfile });

        expect(screen.getByText('Delete User')).toBeDisabled();
    });
});
