import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- promise
- setup
- prefer findBy

- variable - 3
- typeerror - 1
- unnecessary waitFor - 3

- 4 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -35
Testumfang: 27,75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserProfileCardSchwer Component', () => {
    const mockRouterPush = jest.fn();
    const setUserProfile = jest.fn();

    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'http://example.com/john.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        department: 'Engineering',
    };

    beforeAll(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render component with user details', () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /user profile image/i })).toHaveAttribute(
            'src',
            'http://example.com/john.jpg',
        );
    });

    it('should toggle edit mode when edit button is clicked', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);

        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });

    it('should save edited user details when save button is clicked', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const emailInput = screen.getByRole('textbox', { name: /email/i });
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await userEvent.click(saveButton);

        await waitFor(() =>
            expect(setUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                name: 'Jane Doe',
                email: 'jane@example.com',
            }),
        );

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should display an error when image upload fails', async () => {
        global.fetch = jest.fn(() => Promise.reject('API is down')) as jest.Mock;

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText(/change profile picture/i);
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        await userEvent.upload(fileInput, file);

        expect(await screen.findByText('Failed to upload image')).toBeInTheDocument();
    });

    it('should navigate to user profile page when "Show Profile Page" button is clicked', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: /show more/i });
        await userEvent.click(expandButton);

        const profilePageButton = screen.getByRole('button', { name: /show profile page/i });
        await userEvent.click(profilePageButton);

        await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1'));
    });

    it.skip('should display confirmation dialog and delete user when delete button is clicked', async () => {
        global.confirm = jest.fn(() => true);
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await userEvent.click(deleteButton);

        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));
    });

    it.skip('should close snackbar when close icon is clicked', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: /edit/i }));
        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        const closeButton = screen.getByRole('button', { name: /close/i });
        await userEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
