import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup

- variable - 2
- unused import
- typeerror - 1
- unnecessary waitFor - 2

- 4 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -30
Testumfang: 33,3
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserProfileCardSchwer', () => {
    const mockRouter = {
        push: jest.fn(),
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    const currentUser: UserWithId = {
        id: '1',
        name: 'Current User',
        email: 'current@user.com',
        password: 'password',
    };

    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'http://example.com/image.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const setUserProfile = jest.fn();

    it('should render user profile details', () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'http://example.com/image.jpg');
    });

    it('should toggle edit mode', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });

    it('should update user profile on save', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        expect(setUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should handle image upload', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText(/change profile picture/i);
        await user.upload(input, file);

        await waitFor(() => expect(setUserProfile).toHaveBeenCalled());
    });

    it('should navigate to profile page', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: /show more/i });
        await user.click(expandButton);

        const profilePageButton = screen.getByRole('button', { name: /show profile page/i });
        await user.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith(`http://localhost:3000/user?id=${userProfile.id}`);
    });

    it.skip('should delete user', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn().mockImplementation(() => true);
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await user.click(deleteButton);

        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));
    });

    it('should show snackbar message and close it', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
