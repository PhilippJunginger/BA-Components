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
- fireEvent
- assertion missing after action

- render FUnktion
- variable

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -10
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: new Date('2023-04-01'),
    lastLoginDate: new Date('2023-04-10'),
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

    it('should render user profile information', () => {
        setup();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it('should expand and collapse additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        fireEvent.click(expandButton);
        expect(screen.getByText(/Registration Date:/i)).toBeVisible();
        expect(screen.getByText(/Last Login Date:/i)).toBeVisible();

        fireEvent.click(expandButton);
        // Add assertions to check that registration and last login dates are no longer visible
    });

    describe('Edit Functionality', () => {
        it('should allow editing of user profile for current user', async () => {
            setup();
            const editButton = screen.getByRole('button', { name: 'Edit' });
            fireEvent.click(editButton);

            const nameInput = screen.getByRole('textbox', { name: 'Name' });
            const emailInput = screen.getByRole('textbox', { name: 'Email' });
            const saveButton = screen.getByRole('button', { name: 'Save' });

            await userEvent.clear(nameInput);
            await userEvent.type(nameInput, 'Jane Doe');

            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'jane.doe@example.com');

            fireEvent.click(saveButton);

            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        it.skip('should show snackbar message after editing', async () => {
            setup();
            const editButton = screen.getByRole('button', { name: 'Edit' });
            fireEvent.click(editButton);

            const saveButton = screen.getByRole('button', { name: 'Save' });
            fireEvent.click(saveButton);

            expect(screen.getByText('User edited successfully')).toBeVisible();
        });
    });

    describe.skip('Delete Functionality', () => {
        it('should allow deleting user profile within 24 hours of registration', () => {
            const recentRegistrationDate = new Date();
            recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 12); // Set registration to 12 hours ago

            setup({ ...mockUserProfile, registrationDate: recentRegistrationDate });

            const deleteButton = screen.getByRole('button', { name: 'Delete User' });
            expect(deleteButton).not.toBeDisabled();
            fireEvent.click(deleteButton);
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        it('should disable deleting user profile after 24 hours of registration', () => {
            const oldRegistrationDate = new Date();
            oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2); // Set registration to 2 days ago

            setup({ ...mockUserProfile, registrationDate: oldRegistrationDate });

            const deleteButton = screen.getByRole('button', { name: 'Delete User' });
            expect(deleteButton).toBeDisabled();
        });
    });

    it('should not render edit and delete buttons for other users', () => {
        const differentUser: UserWithId = {
            id: '2',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'password123',
        };

        setup(mockUserProfile, differentUser);

        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete User' })).not.toBeInTheDocument();
    });
});
