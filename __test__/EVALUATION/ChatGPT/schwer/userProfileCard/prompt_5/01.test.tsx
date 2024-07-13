import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- fireEvent
- userEvent
- interface usage

- variable - 1
- typeerror - 1
- render Funktion

- 5 von 9 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -40
CleanCode: -15
Testumfang: 33,3
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: '/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const setUserProfile = jest.fn();

const renderComponent = (props: any = {}) =>
    render(
        <UserProfileCardSchwer
            userProfile={mockUserProfile}
            setUserProfile={setUserProfile}
            currentUser={mockCurrentUser}
            {...props}
        />,
    );

describe('UserProfileCardSchwer', () => {
    it('should render the user profile card with the correct information', () => {
        renderComponent();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    describe('Expand Functionality', () => {
        it('should expand and collapse additional user information', () => {
            renderComponent();

            const expandButton = screen.getByLabelText('show more');
            fireEvent.click(expandButton);

            expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
            expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

            fireEvent.click(expandButton);

            expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
        });
    });

    describe('Edit Mode', () => {
        it('should toggle edit mode', () => {
            renderComponent();

            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
        });

        it('should save changes and exit edit mode', async () => {
            renderComponent();

            fireEvent.click(screen.getByText('Edit'));

            fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
            fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });

            fireEvent.click(screen.getByText('Save'));

            await waitFor(() =>
                expect(setUserProfile).toHaveBeenCalledWith({
                    ...mockUserProfile,
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                }),
            );
        });
    });

    describe('Snackbar Handling', () => {
        it('should display and close the snackbar', async () => {
            renderComponent();

            fireEvent.click(screen.getByText('Edit'));

            fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
            fireEvent.click(screen.getByText('Save'));

            await screen.findByText('User edited successfully');

            fireEvent.click(screen.getByLabelText('close'));

            await waitFor(() => expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument());
        });
    });

    describe('Image Upload', () => {
        it('should show an error if the file size exceeds 1MB', async () => {
            renderComponent();

            fireEvent.click(screen.getByText('Edit'));

            const fileInput = screen.getByLabelText('Change Profile Picture');

            const largeFile = new File([new Blob(['a'.repeat(1048577)])], 'large-image.jpg', { type: 'image/jpeg' });

            Object.defineProperty(fileInput, 'files', {
                value: [largeFile],
            });

            fireEvent.change(fileInput);

            await screen.findByText('File size should be less than 1MB');
        });
    });

    describe('Delete User', () => {
        it('should prompt for confirmation before deleting user', () => {
            window.confirm = jest.fn(() => true);
            renderComponent();

            fireEvent.click(screen.getByText('Delete User'));

            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        });

        it('should delete user after confirmation', async () => {
            window.confirm = jest.fn(() => true);
            renderComponent();

            fireEvent.click(screen.getByText('Delete User'));

            await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));
        });

        it('should not delete user if confirmation is canceled', () => {
            window.confirm = jest.fn(() => false);
            renderComponent();

            fireEvent.click(screen.getByText('Delete User'));

            expect(setUserProfile).not.toHaveBeenCalled();
        });
    });
});
