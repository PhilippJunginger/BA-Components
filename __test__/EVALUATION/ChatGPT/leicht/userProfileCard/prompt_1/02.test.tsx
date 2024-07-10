import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- fireEvent

- variable - 3

- 3 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 30
 */

describe('UserProfileCardLeicht Component', () => {
    const currentUser: UserWithId = {
        id: '1',
        name: 'Current User',
        email: 'currentuser@example.com',
        password: 'password123',
    };

    const userProfile: UserProfile = {
        id: '1',
        name: 'Test User',
        email: 'testuser@example.com',
        profileImageUrl: 'https://via.placeholder.com/150',
        registrationDate: new Date('2023-07-09'),
        lastLoginDate: new Date('2023-07-10'),
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component with user profile details', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: testuser@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', userProfile.profileImageUrl);
    });

    test.skip('expands and collapses the details section', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 7/9/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 7/10/2023')).toBeInTheDocument();

        fireEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 7/9/2023')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 7/10/2023')).not.toBeInTheDocument();
    });

    test('toggles edit mode and saves changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated User');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'updateduser@example.com');

        fireEvent.click(screen.getByText('Save'));
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Updated User',
            email: 'updateduser@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('disables delete button if user registered more than 24 hours ago', () => {
        const oldUserProfile = { ...userProfile, registrationDate: new Date('2023-07-07') };
        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    test('enables delete button if user registered within 24 hours', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();

        fireEvent.click(deleteButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    test.skip('closes the snackbar when close button is clicked', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        fireEvent.click(screen.getByText('Edit'));
        fireEvent.click(screen.getByText('Save'));

        const closeButton = screen.getByLabelText('close');
        fireEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
