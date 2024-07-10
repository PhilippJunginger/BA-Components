import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promises

- unused import
- variable - 3


- 5 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 70
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
    registrationDate: new Date('2023-01-01'),
    lastLoginDate: new Date('2023-06-01'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    department: 'Engineering',
};

const setUserProfileMock = jest.fn();

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        setUserProfileMock.mockClear();
    });

    test('renders UserProfileCardLeicht component', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    test('expands and collapses additional user information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 6/1/2023')).toBeInTheDocument();
        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
    });

    test.skip('enters and exits edit mode', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toHaveValue(mockUserProfile.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockUserProfile.email);
        await userEvent.click(screen.getByText('Save'));
        expect(setUserProfileMock).toHaveBeenCalledWith(mockUserProfile);
    });

    test('edits user profile', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.click(screen.getByText('Save'));
        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    test('shows snackbar message on edit', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('deletes user profile if within 24 hours of registration', async () => {
        const recentUserProfile: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // registered 12 hours ago
        };
        render(
            <UserProfileCardLeicht
                userProfile={recentUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);
        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    test.skip('does not delete user profile if registered more than 24 hours ago', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    test('closes snackbar message', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));
        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
