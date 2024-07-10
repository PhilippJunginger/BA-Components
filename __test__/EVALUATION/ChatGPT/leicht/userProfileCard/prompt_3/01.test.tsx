import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- fireEvent
- userEvent

- variable - 2
- unused import

- 3 von 5 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -30
CleanCode: -15
Testumfang: 20
 */

const mockSetUserProfile = jest.fn();

const currentUser: UserWithId = {
    id: '1',
    name: 'Current User',
    email: 'currentuser@example.com',
    password: 'password123',
};

const userProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://via.placeholder.com/150',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};

const setup = (profile = userProfile, current = currentUser) => {
    return render(
        <UserProfileCardLeicht userProfile={profile} setUserProfile={mockSetUserProfile} currentUser={current} />,
    );
};

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile card with user details', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://via.placeholder.com/150');
    });

    test.skip('toggles expand/collapse on expand button click', () => {
        setup();
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        fireEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
    });

    test('enables edit mode and updates user details', () => {
        setup();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });

        fireEvent.click(screen.getByText('Save'));
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('deletes user profile if delete button is clicked within 24 hours of registration', () => {
        setup();
        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    test.skip('disables delete button if registration date is older than 24 hours', () => {
        const oldUserProfile = {
            ...userProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000),
        };
        setup(oldUserProfile);
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    test('closes snackbar when close button is clicked', () => {
        setup();
        fireEvent.click(screen.getByText('Edit'));
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });
        fireEvent.click(screen.getByText('Save'));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('close'));
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    test('does not show edit and delete buttons for other user profiles', () => {
        const otherUserProfile = { ...userProfile, id: '2' };
        setup(otherUserProfile);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });
});
