import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- userEvent
- fireEvent

- variable - 3

- 5 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -15
Testumfang: 80
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: new Date('2023-04-01T10:00:00.000Z'),
    lastLoginDate: new Date('2023-04-05T12:00:00.000Z'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht', () => {
    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it.skip('expands and collapses additional information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 4/1/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 4/5/2023')).toBeVisible();

        fireEvent.click(expandButton);

        // Expect the expanded content to be hidden
        expect(screen.queryByText('Registration Date: 4/1/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 4/5/2023')).not.toBeVisible();
    });

    it('allows editing and saving user profile', () => {
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

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it('shows snackbar message after editing user profile', () => {
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
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: new Date() }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();
    });

    it('deletes user profile when delete button is clicked', () => {
        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });
});
