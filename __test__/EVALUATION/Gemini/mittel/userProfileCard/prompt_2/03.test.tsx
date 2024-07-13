import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- usage of interface
- fireEVemt

- setup
- variable
- typeerror - 2
- render Funktion
- props spreading


- 3 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 56,25
 */

// Mock for the fetch function
global.fetch = jest.fn() as jest.Mock;

describe('UserProfileCardMittel', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const mockUserWithId: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        department: 'Engineering',
    };

    const mockSetUserProfile = jest.fn();

    const setupComponent = (props: any = {}) => {
        return render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                currentUser={mockUserWithId}
                setUserProfile={mockSetUserProfile}
                {...props}
            />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        setupComponent();

        const nameElement = screen.getByText('John Doe');
        const emailElement = screen.getByText('Email: johndoe@example.com');
        const imageElement = screen.getByAltText('User profile image');

        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
        expect(imageElement).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        setupComponent();
        const user = userEvent.setup();

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        const registrationDate = screen.getByText(/Registration Date:/i);
        const lastLoginDate = screen.getByText(/Last Login Date:/i);
        expect(registrationDate).toBeInTheDocument();
        expect(lastLoginDate).toBeInTheDocument();

        await user.click(expandButton);

        expect(registrationDate).not.toBeInTheDocument();
        expect(lastLoginDate).not.toBeInTheDocument();
    });

    it('toggles edit mode and displays edit fields', async () => {
        setupComponent();
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const changeProfileButton = screen.getByText('Change Profile Picture');
        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(changeProfileButton).toBeInTheDocument();

        await user.click(editButton);

        expect(nameInput).not.toBeInTheDocument();
        expect(emailInput).not.toBeInTheDocument();
        expect(changeProfileButton).not.toBeInTheDocument();
    });

    it('edits user profile and displays snackbar message', async () => {
        setupComponent();
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        await user.clear(nameInput);
        await user.clear(emailInput);
        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'janedoe@example.com');

        await user.click(editButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'janedoe@example.com',
        });

        const snackbarMessage = await screen.findByText('User edited successfully');
        expect(snackbarMessage).toBeInTheDocument();
    });

    it('uploads a new profile image', async () => {
        const file = new File(['(binary data)'], 'test.png', { type: 'image/png' });

        const mockResponse = {
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
        };

        global.fetch.mockResolvedValue(mockResponse as Response);

        setupComponent();
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const input = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
                method: 'POST',
                body: expect.any(FormData),
            });
        });
    });

    it.skip('deletes user profile after confirmation', async () => {
        setupComponent();
        const user = userEvent.setup();

        const mockResponse = {
            ok: true,
            status: 200,
            json: async () => ({}),
        };

        global.fetch.mockResolvedValue(mockResponse as Response);

        // Assuming the registration date is older than 1 day, so the delete button is not disabled
        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        // Confirm the deletion
        const confirmDialog = await screen.findByRole('dialog');
        const confirmButton = await screen.findByText('Yes');
        await user.click(confirmButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', {
                method: 'POST',
                body: JSON.stringify({ userId: '1' }),
            });
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    // Add more tests to cover other functionalities and edge cases.
});
