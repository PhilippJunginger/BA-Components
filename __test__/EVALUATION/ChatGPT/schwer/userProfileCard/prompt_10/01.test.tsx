import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- interface usage

- setup
- variable - 3
- type error - 2
- render Funktion
- props spreading
- unnecessary waitFor - 5
- unused import

- 5 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -70
Testumfang: 49,95
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();

describe('UserProfileCardSchwer', () => {
    const setup = (props: any = {}) => {
        const defaultUserProfile: UserProfile = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            profileImageUrl: 'https://example.com/profile.jpg',
            registrationDate: new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
        };

        const defaultCurrentUser: UserWithId = {
            id: '1',
            name: 'Current User',
            email: 'current@example.com',
            password: 'password123',
        };

        const defaultProps = {
            userProfile: defaultUserProfile,
            setUserProfile: jest.fn(),
            currentUser: defaultCurrentUser,
            ...props,
        };

        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        render(<UserProfileCardSchwer {...defaultProps} />);
    };

    it('should render user profile details', () => {
        setup();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    });

    it('should toggle edit mode and update user profile', async () => {
        const user = userEvent.setup();
        const setUserProfileMock = jest.fn();
        setup({ setUserProfile: setUserProfileMock });

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                }),
            );
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should show error when uploading a large image', async () => {
        const user = userEvent.setup();
        setup();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png', size: 2048576 });
        const fileInput = screen.getByLabelText('Change Profile Picture');

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    it('should navigate to profile page on button click', async () => {
        const user = userEvent.setup();
        setup();

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await user.click(expandButton);

        const showProfileButton = screen.getByRole('button', { name: 'Show Profile Page' });
        await user.click(showProfileButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
        });
    });

    it.skip('should delete user after confirmation', async () => {
        const user = userEvent.setup();
        const setUserProfileMock = jest.fn();
        setup({ setUserProfile: setUserProfileMock });

        jest.spyOn(window, 'confirm').mockImplementation(() => true);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await user.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('should display error message when failing to delete user', async () => {
        const user = userEvent.setup();
        setup();

        jest.spyOn(window, 'confirm').mockImplementation(() => true);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
            }),
        ) as jest.Mock;

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
