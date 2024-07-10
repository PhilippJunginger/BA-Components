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

- render FUnktion
- variable - 2

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: new Date('2023-04-01T12:00:00.000Z'),
    lastLoginDate: new Date('2023-04-05T12:00:00.000Z'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const setup = (userProfile: UserProfile = mockUserProfile, currentUser: UserWithId = mockCurrentUser) => {
    render(
        <UserProfileCardLeicht
            userProfile={userProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={currentUser}
        />,
    );
};

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it.skip('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 04/01/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 04/05/2023')).toBeVisible();

        fireEvent.click(expandButton);
        // Expect the expanded content to no longer be visible
        // Note: This assertion depends on how the collapse animation is implemented
        //       and might require adjustments based on the specific implementation.
        expect(screen.queryByText('Registration Date: 04/01/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 04/05/2023')).not.toBeVisible();
    });

    describe('Edit Functionality', () => {
        it.skip('allows editing profile for the current user', async () => {
            setup();
            const editButton = screen.getByRole('button', { name: 'Edit' });
            fireEvent.click(editButton);

            const nameInput = screen.getByRole('textbox', { name: 'Name' });
            const emailInput = screen.getByRole('textbox', { name: 'Email' });

            expect(nameInput).toHaveValue('John Doe');
            expect(emailInput).toHaveValue('john.doe@example.com');

            await userEvent.type(nameInput, ' Jane');
            await userEvent.type(emailInput, 'jane.doe@example.com');

            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'John Doe Jane',
                email: 'jane.doe@example.com',
            });
        });

        it('shows a snackbar message after successful edit', async () => {
            setup();
            const editButton = screen.getByRole('button', { name: 'Edit' });
            fireEvent.click(editButton);

            const nameInput = screen.getByRole('textbox', { name: 'Name' });
            await userEvent.type(nameInput, ' Jane');

            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            expect(screen.getByText('User edited successfully')).toBeVisible();
        });

        it('does not allow editing profile for other users', () => {
            const differentUser: UserWithId = {
                id: '2',
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                password: 'password',
            };
            setup(mockUserProfile, differentUser);
            expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        });
    });

    describe.skip('Delete Functionality', () => {
        it('allows deleting profile within 24 hours of registration', () => {
            const recentRegistrationDate = new Date();
            recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 12); // Set registration to 12 hours ago

            const userProfileWithRecentRegistration: UserProfile = {
                ...mockUserProfile,
                registrationDate: recentRegistrationDate,
            };

            setup(userProfileWithRecentRegistration);
            const deleteButton = screen.getByRole('button', { name: 'Delete User' });
            expect(deleteButton).not.toBeDisabled();
            fireEvent.click(deleteButton);
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        it('disables deleting profile after 24 hours of registration', () => {
            setup();
            const deleteButton = screen.getByRole('button', { name: 'Delete User' });
            expect(deleteButton).toBeDisabled();
        });
    });
});
