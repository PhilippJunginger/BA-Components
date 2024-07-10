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

- variable - 2
- render Funktion
- typeerror

- 5 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -20
Testumfang: 80
 */

const mockSetUserProfile = jest.fn();

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://via.placeholder.com/140',
    registrationDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const setup = (props = {}) => {
    return render(
        <UserProfileCardLeicht
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
            {...props}
        />,
    );
};

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders UserProfileCardLeicht component', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    test.skip('expands and collapses additional info', () => {
        setup();
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText(/Registration Date/i)).toBeInTheDocument();
        fireEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date/i)).not.toBeInTheDocument();
    });

    test('toggles edit mode', () => {
        setup();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        fireEvent.click(editButton);
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    });

    test('edits user profile', async () => {
        setup();
        fireEvent.click(screen.getByText('Edit'));
        await userEvent.type(screen.getByLabelText('Name'), 'New Name');
        await userEvent.type(screen.getByLabelText('Email'), 'new.email@example.com');
        fireEvent.click(screen.getByText('Save'));
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'John DoeNew Name',
            email: 'john.doe@example.comnew.email@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test('displays snackbar and closes it', async () => {
        setup();
        fireEvent.click(screen.getByText('Edit'));
        await userEvent.type(screen.getByLabelText('Name'), 'New Name');
        fireEvent.click(screen.getByText('Save'));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('close'));
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    test('deletes user profile', () => {
        setup();
        fireEvent.click(screen.getByText('Delete User'));
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    test('cannot delete user profile if registered within 24 hours', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(), // registered now
        };
        setup({ userProfile: recentUserProfile });
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
