import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterContext } from 'next/dist/shared/lib/router-context'; // Import RouterContext
import { createMemoryRouter } from 'next/navigation';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer'; // Import createMemoryRouter

/*
- setup
- node access

- variable - 5
- typeerror - 8
- render Funktion
- unused import
- unnecessary module import - 2

- 5 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -85
Testumfang: 38,85
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockRouter = {
    push: jest.fn(),
};

// Mock the fetch function
global.fetch = jest.fn();

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
            { wrapper: RouterContext.Provider, initialEntries: ['/user?id=1'] }, // Provide RouterContext
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it('expands and collapses additional information', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
            { wrapper: RouterContext.Provider, initialEntries: ['/user?id=1'] },
        );

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();

        // Expand
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 03/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 03/16/2023')).toBeVisible();

        // Collapse
        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();
    });

    it('allows editing user profile information', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
            { wrapper: RouterContext.Provider, initialEntries: ['/user?id=1'] },
        );

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

        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: jane.doe@example.com')).toBeInTheDocument();
    });

    it('handles image upload', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
        });

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
            { wrapper: RouterContext.Provider, initialEntries: ['/user?id=1'] },
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByText('Change Profile Picture').querySelector('input[type="file"]')!;
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        // Add assertions to check if the image url is updated
    });

    it('navigates to the profile page', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
            {
                wrapper: ({ children }) => (
                    <RouterContext.Provider
                        router={mockRouter as any} // Provide the mocked router
                    >
                        {children}
                    </RouterContext.Provider>
                ),
                initialEntries: ['/user?id=1'],
            },
        );

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it('deletes user profile', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        const setUserProfileMock = jest.fn();

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
            { wrapper: RouterContext.Provider, initialEntries: ['/user?id=1'] },
        );

        // Mock the window.confirm function to return true (confirm deletion)
        window.confirm = jest.fn(() => true);

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    it('shows snackbar messages', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
            { wrapper: RouterContext.Provider, initialEntries: ['/user?id=1'] },
        );

        // Test successful user edit
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);
        expect(screen.getByText('User edited successfully')).toBeVisible();

        // Test close snackbar
        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);
        expect(screen.queryByText('User edited successfully')).not.toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23); // Set registration time to 23 hours ago

        render(
            <UserProfileCardSchwer
                userProfile={{ ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() }}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
            { wrapper: RouterContext.Provider, initialEntries: ['/user?id=1'] },
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
