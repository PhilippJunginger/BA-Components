import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- fireEvent

- unnecessary mock of mui
- unused import
- variable - 1

- 3 von 5 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 20
 */

// Mock MUI components
jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid='card'>{children}</div>,
    CardMedia: ({ alt }: { alt: string }) => <img alt={alt} data-testid='card-media' />,
    CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid='card-content'>{children}</div>,
    CardActions: ({ children }: { children: React.ReactNode }) => <div data-testid='card-actions'>{children}</div>,
    Collapse: ({ children, in: open }: { children: React.ReactNode; in: boolean }) => (
        <div data-testid='collapse' data-open={open}>
            {children}
        </div>
    ),
    IconButton: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
        <button data-testid='icon-button' onClick={onClick}>
            {children}
        </button>
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
    profileImageUrl: 'http://example.com/profile.jpg',
    registrationDate: new Date('2023-01-01'),
    lastLoginDate: new Date('2023-06-01'),
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

        const expandButton = screen.getByTestId('icon-button');

        // Initially collapsed
        expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'false');

        // Expand
        fireEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'true');
        });

        expect(
            screen.getByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${mockUserProfile.lastLoginDate.toLocaleDateString()}`),
        ).toBeInTheDocument();

        // Collapse
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

        expect(nameInput).toHaveValue(mockUserProfile.name);
        expect(emailInput).toHaveValue(mockUserProfile.email);

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

        expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
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

    it.skip('disables delete button if user registered more than 24 hours ago', () => {
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

    it.skip('enables delete button if user registered less than 24 hours ago', () => {
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
});
