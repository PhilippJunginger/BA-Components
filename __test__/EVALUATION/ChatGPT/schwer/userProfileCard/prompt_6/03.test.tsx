import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- fireEvent
- interface usage

- setup
- variable - 2
- typeerror - 1
- render Funktion
- props spreading

- 6 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 49,95
 */

// Mock useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/profile.jpg',
    registrationDate: '2023-01-01',
    lastLoginDate: '2023-06-01',
};

const mockCurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: jest.fn(),
        currentUser: mockCurrentUser,
        ...props,
    };

    return render(<UserProfileCardSchwer {...defaultProps} />);
};

describe('UserProfileCardSchwer', () => {
    it('should render user profile information', () => {
        renderComponent();

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('should toggle edit mode', async () => {
        const user = userEvent.setup();
        renderComponent();

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should edit user information', async () => {
        const user = userEvent.setup();
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        await user.click(screen.getByRole('button', { name: /edit/i }));

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByRole('button', { name: /save/i }));

        expect(setUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it.skip('should navigate to profile page', async () => {
        const user = userEvent.setup();
        renderComponent();

        const showProfileButton = screen.getByRole('button', { name: /show profile page/i });
        await user.click(showProfileButton);

        expect(mockPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
    });

    it.skip('should show snackbar message', async () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /close/i }));

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });

    it('should handle image upload with error', async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
            }),
        ) as jest.Mock;

        renderComponent();
        await user.click(screen.getByRole('button', { name: /edit/i }));

        const file = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText(/change profile picture/i);
        await user.upload(fileInput, file);

        expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
    });

    it.skip('should handle image upload successfully', async () => {
        const user = userEvent.setup();
        const setUserProfile = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ profileImageUrl: 'http://example.com/new-profile.jpg' }),
            }),
        ) as jest.Mock;

        renderComponent({ setUserProfile });
        await user.click(screen.getByRole('button', { name: /edit/i }));

        const file = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText(/change profile picture/i);
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'http://example.com/new-profile.jpg',
            });
        });
    });

    it('should delete user', async () => {
        const user = userEvent.setup();
        const setUserProfile = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;

        renderComponent({ setUserProfile });
        window.confirm = jest.fn(() => true);

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await user.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('should not delete user if not confirmed', async () => {
        const user = userEvent.setup();
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });
        window.confirm = jest.fn(() => false);

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await user.click(deleteButton);

        expect(setUserProfile).not.toHaveBeenCalled();
    });
});
