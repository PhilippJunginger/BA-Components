import { render, screen, fireEvent } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- fireEvent
- node access
- interface usage

- variable - 6
- typeerror - 3
- render Funktion
- props spreading
- unnecessary module - 2

- 8 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -65
Testumfang: 77,7
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

const mockSetUserProfile = jest.fn();

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: mockCurrentUser,
    };

    return render(
        <SnackbarProvider>
            <RouterContext.Provider value={mockRouter as any}>
                <UserProfileCardSchwer {...defaultProps} {...props} />
            </RouterContext.Provider>
        </SnackbarProvider>,
    );
};

describe('UserProfileCardSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        renderComponent();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it('expands and collapses the card content', async () => {
        renderComponent();

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 15/03/2023')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();
    });

    it('toggles edit mode and saves changes', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const saveButton = screen.getByText('Save');

        await userEvent.type(nameInput, ' Jane');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'John Doe Jane',
            email: 'jane.doe@example.com',
        });
    });

    it('uploads a new profile image', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
        });

        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen
            .getByLabelText('Change Profile Picture')
            .querySelector('input[type="file"]') as HTMLInputElement;
        const mockFile = new File([''], 'profile-image.jpg', { type: 'image/jpeg' });
        Object.defineProperty(fileInput, 'files', {
            value: [mockFile],
        });

        await userEvent.click(fileInput);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-image.jpg',
        });
    });

    it('shows an error message if image upload fails', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to upload image'));

        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen
            .getByLabelText('Change Profile Picture')
            .querySelector('input[type="file"]') as HTMLInputElement;
        const mockFile = new File([''], 'profile-image.jpg', { type: 'image/jpeg' });
        Object.defineProperty(fileInput, 'files', {
            value: [mockFile],
        });

        await userEvent.click(fileInput);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('navigates to the user profile page', async () => {
        renderComponent();

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it('deletes the user', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
        });

        jest.spyOn(window, 'confirm').mockReturnValue(true);

        renderComponent();

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('does not delete the user if confirmation is canceled', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(false);

        renderComponent();

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(mockSetUserProfile).not.toHaveBeenCalled();
    });

    it('disables the delete button if the user is less than 24 hours old', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 12);

        renderComponent({
            userProfile: { ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() },
        });

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('enables the delete button if the user is more than 24 hours old', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);

        renderComponent({
            userProfile: { ...mockUserProfile, registrationDate: oldRegistrationDate.toISOString() },
        });

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();
    });
});
