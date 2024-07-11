import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { server } from '../mocks/server';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel'; // Assuming you have a setup for msw for mocking server responses

/*
- promises
- waitFor
- node access

- before* outside of describe
- variable - 2
- typeerror - 1
- const missing
- unused import
- import of not needed module
- unnecessary if in test
- unnecessary waitFor - 4

- 5 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -60
Testumfang: 50
 */

// Mock the fetch API
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    department: 'Engineering',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel Component', () => {
    it('renders the component with user profile data', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('toggles edit mode when edit button is clicked', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it('saves edited user profile and displays success message', async () => {
        render(
            <UserProfileCardMittel
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
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                }),
            );
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it('displays error message when image upload fails', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        // Simulate a file upload error
        server.use(
            rest.post('https://example.com/api/upload-image', (req, res, ctx) => {
                return res(ctx.status(500));
            }),
        );

        if (fileInput) {
            await userEvent.upload(fileInput, file);
        }

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('handles user deletion and displays success message', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });

    it('displays correct dates in collapsed section', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
    });

    it('closes snackbar when close button is clicked', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
