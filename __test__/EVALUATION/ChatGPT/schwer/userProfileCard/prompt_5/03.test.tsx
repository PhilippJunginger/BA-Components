import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises
- interface usage

- variable - 2
- typeerror - 1
- unnecessary waitFor - 4
- render Funktion
- props spreading
- unused import

- 4 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -50
Testumfang: 33,33
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();

(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

const defaultProps: any = {
    userProfile: mockUserProfile,
    setUserProfile: mockSetUserProfile,
    currentUser: mockCurrentUser,
};

describe('UserProfileCardSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile information', () => {
        render(<UserProfileCardSchwer {...defaultProps} />);
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    test.skip('toggles edit mode and saves changes', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        // Click edit button
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        // Edit name
        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        // Edit email
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        // Click save button
        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: jane.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test('expands and collapses additional information', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await userEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    test('navigates to profile page', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
        });
    });

    test.skip('handles image upload', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['image content'], 'test-image.jpg', { type: 'image/jpeg' });

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'http://example.com/uploaded-image.jpg',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('handles delete user', async () => {
        window.confirm = jest.fn().mockReturnValue(true);

        render(<UserProfileCardSchwer {...defaultProps} />);

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });
});
