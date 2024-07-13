import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- fireEvent

- variable - 4
- typeerror - 11

- 8 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -75
Testumfang: 77,7
 */

const currentUser: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
};

const userProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T12:00:00.000Z',
};

const mockRouter = {
    push: jest.fn(),
};

jest.mock('next/router', () => ({
    useRouter: () => mockRouter,
}));

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => {
                return { profileImageUrl: 'https://example.com/updated-profile-picture.jpg' };
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders user profile information', () => {
        render(<UserProfileCardSchwer userProfile={userProfile} setUserProfile={() => {}} currentUser={currentUser} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it.skip('expands and collapses additional information', async () => {
        render(<UserProfileCardSchwer userProfile={userProfile} setUserProfile={() => {}} currentUser={currentUser} />);

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 3/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 3/16/2023')).toBeVisible();

        await userEvent.click(expandButton);

        // Expect the content to be hidden after collapsing
        expect(screen.queryByText('Registration Date: 3/15/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 3/16/2023')).not.toBeVisible();
    });

    it('navigates to the profile page', async () => {
        render(<UserProfileCardSchwer userProfile={userProfile} setUserProfile={() => {}} currentUser={currentUser} />);

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it.skip('toggles edit mode', async () => {
        render(<UserProfileCardSchwer userProfile={userProfile} setUserProfile={() => {}} currentUser={currentUser} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        expect(screen.getByRole('textbox', { name: 'Name' })).toBeVisible();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeVisible();
        expect(screen.getByText('Change Profile Picture')).toBeVisible();

        await userEvent.click(editButton);

        expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeVisible();
        expect(screen.queryByRole('textbox', { name: 'Email' })).not.toBeVisible();
        expect(screen.queryByText('Change Profile Picture')).not.toBeVisible();
    });

    it('updates user profile', async () => {
        const setUserProfile = jest.fn();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(editButton);

        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it.skip('uploads a new profile image', async () => {
        render(<UserProfileCardSchwer userProfile={userProfile} setUserProfile={() => {}} currentUser={currentUser} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(await screen.findByText('User edited successfully')).toBeVisible();
    });

    it('shows error message when image upload fails', async () => {
        window.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        render(<UserProfileCardSchwer userProfile={userProfile} setUserProfile={() => {}} currentUser={currentUser} />);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(await screen.findByText('Failed to upload image')).toBeVisible();
    });

    it('deletes user', async () => {
        const setUserProfile = jest.fn();
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('shows error message when user deletion fails', async () => {
        window.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const setUserProfile = jest.fn();
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(await screen.findByText('Failed to delete user')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23);

        render(
            <UserProfileCardSchwer
                userProfile={{ ...userProfile, registrationDate: recentRegistrationDate.toISOString() }}
                setUserProfile={() => {}}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });
});
