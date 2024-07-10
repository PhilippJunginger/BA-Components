import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- promises
- fireEvent
- render in beforeEach
- setup

- variable - 3
- unused import

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -20
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date('2023-07-01'),
    lastLoginDate: new Date('2023-07-09'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

describe('UserProfileCardLeicht', () => {
    let setUserProfileMock: jest.Mock;

    beforeEach(() => {
        setUserProfileMock = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
    });

    test('renders user profile information', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    test.skip('expands and collapses details section', () => {
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 7/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 7/9/2023')).toBeInTheDocument();
        fireEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 7/1/2023')).not.toBeInTheDocument();
    });

    test('enables edit mode and updates user information', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test('handles user deletion correctly', async () => {
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();

        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
        });
    });

    test.skip('disables delete button if registration date is less than a day ago', () => {
        const mockNewUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(),
        };

        setUserProfileMock = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={mockNewUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    test.skip('closes snackbar on close button click', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        await userEvent.click(screen.getByText('Save'));

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
