import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- waitFOr assertions

- variable
- unused import
- unnecessary waitFor - 3

- 4 von 5 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 70
 */

describe('UserProfileCardLeicht', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
        department: 'Engineering',
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile details correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    test('expands and collapses additional details', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);
        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
    });

    test.skip('toggles edit mode and saves changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'janedoe@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
            expect(screen.getByText('Email: janedoe@example.com')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'janedoe@example.com',
            });
        });
    });

    test.skip('deletes user profile', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000) }} // Simulate registration less than 24 hours ago
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).not.toBeDisabled();

        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    test('shows snackbar message on edit', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });
});
