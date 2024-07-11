import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- fireEvent
- setup
- waitFor assertions

- variable - 3



- 5 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -15
Testumfang: 70
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'http://example.com/profile.jpg',
    registrationDate: new Date('2023-01-01'),
    lastLoginDate: new Date('2023-06-01'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-06-02'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'http://example.com/profile.jpg');
    });

    it('expands and collapses additional information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
            expect(screen.getByText('Last Login Date: 6/1/2023')).toBeInTheDocument();
        });

        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
            expect(screen.queryByText('Last Login Date: 6/1/2023')).not.toBeInTheDocument();
        });
    });

    it.skip('allows editing of user profile for current user', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it('disables delete button within 24 hours of registration', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date('2023-06-01T23:59:59'),
        };

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

    it('enables delete button after 24 hours of registration', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();
    });

    it('calls setUserProfile with undefined when delete button is clicked', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('does not show edit and delete buttons for non-current user', () => {
        const otherUser: UserWithId = { ...mockCurrentUser, id: '2' };

        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={otherUser}
            />,
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it.skip('closes snackbar when close button is clicked', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Trigger the snackbar
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText('close');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
