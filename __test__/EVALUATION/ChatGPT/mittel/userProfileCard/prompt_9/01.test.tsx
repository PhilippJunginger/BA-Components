import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- promsises
- fireevent
- prefer queryBy with .not

- variable - 2
- typeerror - 2
- unnecessary waitFor - 3


- 4 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -35
Testumfang: 43,75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        mockSetUserProfile.mockClear();
    });

    test('renders user profile information', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    test.skip('expands and collapses additional information', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        fireEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
    });

    test('enters edit mode and updates user profile', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameField = screen.getByLabelText('Name');
        await userEvent.clear(nameField);
        await userEvent.type(nameField, 'Jane Doe');

        const emailField = screen.getByLabelText('Email');
        await userEvent.clear(emailField);
        await userEvent.type(emailField, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                }),
            );
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('uploads profile image and shows error for large file', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['image content'], 'image.jpg', { type: 'image/jpeg', size: 2000000 });
        const input = screen.getByLabelText(/Change Profile Picture/i);

        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    test.skip('deletes user profile', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        expect(screen.getByText('Failed to delete user')).not.toBeInTheDocument();
    });
});
