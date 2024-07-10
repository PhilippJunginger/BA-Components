import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- promises
- setup

- unused import
- variable - 2

- 5 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 80
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://via.placeholder.com/150',
    registrationDate: new Date('2023-01-01'),
    lastLoginDate: new Date('2023-06-01'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

const setup = () => {
    render(
        <UserProfileCardLeicht
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
        />,
    );
};

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile details', () => {
        setup();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    test('expands and collapses additional user information', async () => {
        setup();

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText(/Registration Date/)).not.toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.getByText(/Registration Date/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date/)).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date/)).not.toBeInTheDocument();
    });

    test('enters and exits edit mode', async () => {
        setup();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    });

    test('edits user details and shows snackbar', async () => {
        setup();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            }),
        );

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test('deletes user if conditions are met', async () => {
        setup();

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();

        await userEvent.click(deleteButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    test.skip('disables delete button if conditions are not met', () => {
        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Registered 2 days ago
        };
        render(
            <UserProfileCardLeicht
                userProfile={newUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    test.skip('closes snackbar', async () => {
        setup();

        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
