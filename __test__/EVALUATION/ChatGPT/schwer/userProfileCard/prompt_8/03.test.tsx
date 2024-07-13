import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- interface usage

- variable - 2
- unused import
- typeerror - 1
- unnecessary waitFor
- props spreading

- 4 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 27,75
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
        profileImageUrl: 'https://example.com/profile.jpg',
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

    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: mockCurrentUser,
    };

    it('should render user profile details', () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('should toggle edit mode', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

        await userEvent.click(editButton);

        expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });

    it('should update user profile on save', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(editButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should handle image upload', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText(/change profile picture/i);

        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    profileImageUrl: expect.any(String),
                }),
            );
        });
    });

    it.skip('should navigate to profile page', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        const showProfileButton = screen.getByRole('button', { name: /show profile page/i });
        await userEvent.click(showProfileButton);

        expect(mockRouterPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
    });

    it.skip('should handle delete user', async () => {
        window.confirm = jest.fn().mockImplementation(() => true);

        render(<UserProfileCardSchwer {...defaultProps} />);

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('should show snackbar message', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);
        await userEvent.click(editButton);

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        const closeButton = screen.getByRole('button', { name: /close/i });
        await userEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
