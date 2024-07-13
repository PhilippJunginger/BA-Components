import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- interface usage

- variable - 6
- unused import
- typeerror
- render Funktion
- props spreading

- 9 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -50
Testumfang: 94,35
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

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

const mockSetUserProfile = jest.fn();

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockRouterPush = jest.fn();

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: mockCurrentUser,
    };

    return render(<UserProfileCardSchwer {...defaultProps} {...props} />);
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
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

    it.skip('expands and collapses additional information', async () => {
        renderComponent();

        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText('Registration Date: 15/03/2023')).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 15/03/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 16/03/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 15/03/2023')).not.toBeVisible();
    });

    it.skip('navigates to the user profile page', async () => {
        renderComponent();

        const showProfilePageButton = screen.getByRole('button', { name: 'Show Profile Page' });
        await userEvent.click(showProfilePageButton);

        expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it('toggles edit mode and saves changes', async () => {
        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('John Doe');
        expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('john.doe@example.com');

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('uploads a new profile image', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
        });

        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-image.jpg',
        });
    });

    it('shows an error message if image upload fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to upload image'));

        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it.skip('deletes the user', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        renderComponent();

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('shows an error message if user deletion fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to delete user'));

        renderComponent();

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23);

        renderComponent({
            userProfile: { ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() },
        });

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);

        renderComponent({
            userProfile: { ...mockUserProfile, registrationDate: oldRegistrationDate.toISOString() },
        });

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeEnabled();
    });
});
