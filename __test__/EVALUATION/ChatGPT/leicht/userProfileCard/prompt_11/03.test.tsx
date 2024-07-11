import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- render beforeEach
- setup
- promises

- unused import
- variable - 2

- 3 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -15
Testumfang: 40
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://via.placeholder.com/150',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
    });

    test('renders user profile information', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    test('expands and collapses additional information', async () => {
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
        await userEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
    });

    test('toggles edit mode and saves changes', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('deletes user profile', async () => {
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    test('closes snackbar message', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
