import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- fireEvent
- render beforeEach
- userEvent

- unused import
- variable - 2

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -15
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://via.placeholder.com/150',
    registrationDate: new Date(Date.now() - 86400000), // 1 day ago
    lastLoginDate: new Date(Date.now() - 3600000), // 1 hour ago
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

    test('renders user profile correctly', () => {
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    test.skip('expands and collapses on icon click', () => {
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        fireEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    test('enters and exits edit mode correctly', () => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });

        fireEvent.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            }),
        );

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    });

    test('shows snackbar on successful edit', () => {
        fireEvent.click(screen.getByText('Edit'));

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });

        fireEvent.click(screen.getByText('Save'));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('close'));
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    test('deletes user correctly', () => {
        fireEvent.click(screen.getByText('Delete User'));
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    test.skip('delete button is disabled if user was registered more than a day ago', () => {
        jest.useFakeTimers().setSystemTime(new Date(Date.now() + 2 * 86400000)); // 2 days later
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
        jest.useRealTimers();
    });
});
