import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*


- setup
- variable - 3
- typeerror - 1
- render Funktion
- props spreading
- unnecessary waitFor - 2

- 5 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: 0
CleanCode: -45
Testumfang: 44,4
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe('UserProfileCardSchwer Component', () => {
    const currentUser: UserWithId = {
        id: '1',
        name: 'Current User',
        email: 'currentuser@example.com',
        password: 'password',
    };

    const userProfile: UserProfile = {
        id: '1',
        name: 'Test User',
        email: 'testuser@example.com',
        profileImageUrl: 'testimage.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const setUserProfile = jest.fn();

    const setup = (props = {}) => {
        return render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
                {...props}
            />,
        );
    };

    it('should render the component with user profile details', () => {
        setup();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: testuser@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'testimage.jpg');
    });

    it('should toggle edit mode and save changes', async () => {
        setup();
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Updated User');
        await user.clear(emailInput);
        await user.type(emailInput, 'updateduser@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Updated User',
            email: 'updateduser@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should handle image upload', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ profileImageUrl: 'newimage.jpg' }),
            }),
        ) as jest.Mock;

        setup();
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                profileImageUrl: 'newimage.jpg',
            });
        });
    });

    it('should navigate to profile page on button click', async () => {
        setup();
        const user = userEvent.setup();

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        const profilePageButton = screen.getByRole('button', { name: 'Show Profile Page' });
        await user.click(profilePageButton);

        expect(mockPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${userProfile.id}`);
    });

    it.skip('should handle delete user', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            }),
        ) as jest.Mock;

        window.confirm = jest.fn(() => true);

        setup();
        const user = userEvent.setup();

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await user.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('should handle snackbar close', async () => {
        setup();
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it('should not allow delete user if registration date is less than a day', () => {
        const recentUserProfile = {
            ...userProfile,
            registrationDate: new Date().toISOString(),
        };

        setup({ userProfile: recentUserProfile });

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });
});
