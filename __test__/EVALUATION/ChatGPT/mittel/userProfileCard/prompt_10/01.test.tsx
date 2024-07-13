import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- fireevent
- render in beforeEach

- variable - 3
- typeerror
- unused import


- 4 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -25
Testumfang: 37,5
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-07-10T00:00:00Z',
    lastLoginDate: '2023-07-11T00:00:00Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

describe('UserProfileCardMittel Component', () => {
    const setUserProfile = jest.fn();

    beforeEach(() => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
    });

    test('displays user profile details', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    test('expands and collapses additional information', async () => {
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 7/10/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 7/11/2023')).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 7/10/2023')).not.toBeInTheDocument();
    });

    test('enters edit mode and updates user profile', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));

        expect(setUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test('shows error message for large image upload', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large-image.jpg', { type: 'image/jpeg' });

        const fileInput = screen.getByLabelText('Change Profile Picture');
        Object.defineProperty(fileInput, 'files', { value: [file] });

        fireEvent.change(fileInput);

        expect(await screen.findByText('File size should be less than 1MB')).toBeInTheDocument();
    });

    test.skip('deletes user profile', async () => {
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    test.skip('closes snackbar', async () => {
        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
