import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*


- variable - 3
- unused import
- setup

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: 0
CleanCode: -25
Testumfang: 60
 */

describe('UserProfileCardLeicht Component', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://via.placeholder.com/150',
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://via.placeholder.com/150');
    });

    it('should toggle edit mode and save changes', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should expand and collapse additional user information', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 1/10/2023')).toBeInTheDocument();

        await user.click(expandButton);

        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 1/10/2023')).not.toBeInTheDocument();
    });

    it('should delete user if allowed', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should not delete user if not allowed', () => {
        const oldUserProfile = { ...mockUserProfile, registrationDate: new Date('2022-01-01') };
        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        expect(deleteButton).toBeDisabled();
    });

    it('should close snackbar message', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
