import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- waitFor assertions
- fireEvent
- setup

- variable - 1
- unnecesssary mock
- render Funktion

- 3 von 5 notwendigem Testumfang erreicht + 5 Redundanz

Best-Practices: -30
CleanCode: -15
Testumfang: 10
 */

// Mock MUI components
jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid='card'>{children}</div>,
    CardMedia: ({ alt }: { alt: string }) => <img alt={alt} data-testid='card-media' />,
    CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid='card-content'>{children}</div>,
    CardActions: ({ children }: { children: React.ReactNode }) => <div data-testid='card-actions'>{children}</div>,
    Collapse: ({ children, in: isOpen }: { children: React.ReactNode; in: boolean }) => (
        <div data-testid='collapse' data-open={isOpen}>
            {children}
        </div>
    ),
    Snackbar: ({ open, message }: { open: boolean; message: string }) => (
        <div data-testid='snackbar' data-open={open}>
            {message}
        </div>
    ),
}));

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date('2023-01-01'),
    lastLoginDate: new Date('2023-05-01'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByTestId('card-media')).toHaveAttribute('alt', 'User profile image');
    });

    it('expands and collapses additional information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'true');
            expect(
                screen.getByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
            ).toBeInTheDocument();
            expect(
                screen.getByText(`Last Login Date: ${mockUserProfile.lastLoginDate.toLocaleDateString()}`),
            ).toBeInTheDocument();
        });

        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'false');
        });
    });

    it("allows editing when it is the current user's profile", async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });

        await waitFor(() => {
            expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it('does not show edit and delete buttons for non-current user profiles', () => {
        const differentUser: UserWithId = { ...mockCurrentUser, id: '2' };
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={differentUser}
            />,
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it.skip('disables delete button if user registration is older than 24 hours', () => {
        const oldUser: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        };

        render(
            <UserProfileCardLeicht
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('enables delete button if user registration is within 24 hours', () => {
        const newUser: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };

        render(
            <UserProfileCardLeicht
                userProfile={newUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();
    });

    it.skip('calls setUserProfile with undefined when delete button is clicked', () => {
        const newUser: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };

        render(
            <UserProfileCardLeicht
                userProfile={newUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('closes snackbar when close button is clicked', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Trigger snackbar by editing user
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
        });

        const closeButton = screen.getByLabelText('close');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'false');
        });
    });
});
