import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup

- variable
- unused import
- typeerror - 1

- 4 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -10
CleanCode: -15
Testumfang: 27,75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const currentUser: UserWithId = {
    id: '1',
    name: 'Current User',
    email: 'currentuser@example.com',
    password: 'password',
};

const userProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const setup = (props: any = {}) => {
    const setUserProfile = jest.fn();
    const utils = render(
        <UserProfileCardSchwer
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            currentUser={currentUser}
            {...props}
        />,
    );
    return { ...utils, setUserProfile };
};

describe('UserProfileCardSchwer', () => {
    it('should render user profile details', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'http://example.com/profile.jpg');
    });

    it.skip('should toggle edit mode', async () => {
        const { setUserProfile } = setup();
        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(setUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should handle image upload', async () => {
        const { setUserProfile } = setup();
        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText(/change profile picture/i);
        await userEvent.upload(input, file);
        await waitFor(() => expect(setUserProfile).toHaveBeenCalled());
    });

    it('should navigate to profile page', async () => {
        setup();
        const expandButton = screen.getByLabelText(/show more/i);
        await userEvent.click(expandButton);
        const profilePageButton = screen.getByRole('button', { name: /show profile page/i });
        await userEvent.click(profilePageButton);
        expect(mockPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${userProfile.id}`);
    });

    it.skip('should handle snackbar close', async () => {
        setup();
        const closeButton = screen.getByRole('button', { name: /close/i });
        await userEvent.click(closeButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it.skip('should handle user deletion', async () => {
        global.confirm = jest.fn(() => true);
        const { setUserProfile } = setup();
        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await userEvent.click(deleteButton);
        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));
    });

    it('should disable delete button for recent registrations', () => {
        setup();
        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        expect(deleteButton).toBeDisabled();
    });
});
