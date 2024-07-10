import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- waitFor assertions
- setup

- variable - 3
- unused import

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/profile.jpg',
    registrationDate: new Date('2023-07-08'),
    lastLoginDate: new Date('2024-07-09'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    department: 'Engineering',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht Component', () => {
    beforeEach(() => {
        mockSetUserProfile.mockClear();
    });

    it('renders user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'http://example.com/profile.jpg');
    });

    it('toggles edit mode and allows editing user information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

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

    it('toggles the expanded state and shows additional user information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByText('Registration Date: 7/8/2023')).toBeInTheDocument();
            expect(screen.getByText('Last Login Date: 7/9/2024')).toBeInTheDocument();
        });
    });

    it('disables the delete button if user is registered less than a day ago', () => {
        const recentUserProfile = { ...mockUserProfile, registrationDate: new Date() };
        render(
            <UserProfileCardLeicht
                userProfile={recentUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('enables the delete button and deletes the user profile', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();

        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('closes the snackbar when the close icon is clicked', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByLabelText('close'));

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
