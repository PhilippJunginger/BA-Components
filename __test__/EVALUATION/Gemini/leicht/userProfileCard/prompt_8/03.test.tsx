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
- variable - 3
- typeError

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: new Date('2023-04-01'),
    lastLoginDate: new Date('2023-04-05'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const setup = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    return render(
        <UserProfileCardLeicht
            userProfile={userProfile || mockUserProfile}
            setUserProfile={() => {}}
            currentUser={currentUser || mockCurrentUser}
        />,
    );
};

describe('UserProfileCardLeicht', () => {
    it('should render user profile information', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it.skip('should expand and collapse additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 04/01/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 04/05/2023')).toBeVisible();

        fireEvent.click(expandButton);
        // Expect the content to be hidden (not present in the DOM)
        expect(screen.queryByText('Registration Date: 04/01/2023')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 04/05/2023')).not.toBeInTheDocument();
    });

    it.skip('should allow editing user profile', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, ' Jane');
        await userEvent.type(emailInput, 'jane.doe@example.com');

        fireEvent.click(editButton); // Save changes

        expect(screen.getByText('John Doe Jane')).toBeInTheDocument();
        expect(screen.getByText('Email: jane.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('should disable delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setDate(recentRegistrationDate.getDate() - 1); // Yesterday

        setup({ ...mockUserProfile, registrationDate: recentRegistrationDate });

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date('2023-03-01');
        setup({ ...mockUserProfile, registrationDate: oldRegistrationDate });

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();
    });

    it.skip('should delete user profile', async () => {
        const setUserProfile = jest.fn();
        setup({ ...mockUserProfile, registrationDate: new Date('2023-03-01') }, mockCurrentUser, setUserProfile);

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });
});
