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
- variablen - 2

- 1 von 5 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 10
 */

describe('UserProfileCardLeicht', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        profileImageUrl: 'https://example.com/avatar.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };
    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };

    test('renders user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    });

    test('switches to edit mode and updates user information', async () => {
        const mockSetUserProfile = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'updated@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Updated Name',
            email: 'updated@example.com',
        });
    });

    // ... additional tests for delete functionality, Snackbar messages, etc.
});
