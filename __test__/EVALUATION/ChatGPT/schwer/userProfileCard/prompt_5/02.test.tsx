import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises

- variable - 4
- typeerror - 1
- unnecessary waitFor - 5
- unused import
- render Funktion

- 5 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -60
Testumfang: 38,85
 */

// Mock the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00Z',
    lastLoginDate: '2023-01-10T00:00:00Z',
};

const mockCurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const setup = (editMode = false) => {
    render(
        <UserProfileCardSchwer
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
        />,
    );
};

describe('UserProfileCardSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile information correctly', () => {
        setup();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    test('toggles edit mode correctly', async () => {
        setup();

        const editButton = screen.getByRole('button', { name: /edit/i });
        await userEvent.click(editButton);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

        const saveButton = screen.getByRole('button', { name: /save/i });
        await userEvent.click(saveButton);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    test.skip('handles user profile update correctly', async () => {
        setup();

        await userEvent.click(screen.getByRole('button', { name: /edit/i }));

        await userEvent.clear(screen.getByLabelText(/name/i));
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');

        await userEvent.clear(screen.getByLabelText(/email/i));
        await userEvent.type(screen.getByLabelText(/email/i), 'jane.doe@example.com');

        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() =>
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            }),
        );

        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: jane.doe@example.com')).toBeInTheDocument();
    });

    test('navigates to profile page on button click', async () => {
        setup();

        const expandButton = screen.getByRole('button', { name: /show more/i });
        await userEvent.click(expandButton);

        const profileButton = await screen.findByRole('button', { name: /show profile page/i });
        await userEvent.click(profileButton);

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1'));
    });

    test('displays snackbar message on profile update', async () => {
        setup();

        await userEvent.click(screen.getByRole('button', { name: /edit/i }));

        await userEvent.clear(screen.getByLabelText(/name/i));
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');

        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        await screen.findByText(/user edited successfully/i);

        await userEvent.click(screen.getByLabelText(/close/i));

        await waitFor(() => expect(screen.queryByText(/user edited successfully/i)).not.toBeInTheDocument());
    });

    test.skip('deletes user when confirmed', async () => {
        global.confirm = jest.fn(() => true);

        setup();

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await userEvent.click(deleteButton);

        await waitFor(() => expect(mockSetUserProfile).toHaveBeenCalledWith(undefined));
    });

    test('does not delete user when not confirmed', async () => {
        global.confirm = jest.fn(() => false);

        setup();

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await userEvent.click(deleteButton);

        await waitFor(() => expect(mockSetUserProfile).not.toHaveBeenCalled());
    });

    test('disables delete button if user registered less than a day ago', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardSchwer
                userProfile={recentUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        expect(deleteButton).toBeDisabled();
    });
});
