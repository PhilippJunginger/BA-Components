import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- render in beforeEach

- variable - 2
- unused import

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -15
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date('2023-01-01'),
    lastLoginDate: new Date('2023-01-10'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
    });

    it('should render user profile information', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it('should toggle edit mode and save changes', async () => {
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should expand and collapse additional user information', async () => {
        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 1/10/2023')).toBeInTheDocument();

        await user.click(expandButton);
        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
    });

    it('should delete user if allowed', async () => {
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should disable delete button if user cannot be deleted', () => {
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });

    it.skip('should close snackbar message', async () => {
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
