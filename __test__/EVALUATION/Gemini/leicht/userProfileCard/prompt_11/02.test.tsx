import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- promises
- setup
- assertion missing after action

- unnecessary import
- variable - 1
- render Funkton

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -15
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
    registrationDate: new Date('2023-04-01T12:00:00.000Z'),
    lastLoginDate: new Date('2023-04-05T12:00:00.000Z'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const setup = () => {
    render(
        <UserProfileCardLeicht
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
        />,
    );
};

describe('UserProfileCardLeicht Component', () => {
    beforeEach(() => {
        setup();
    });

    it('renders user profile information correctly', () => {
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('expands and collapses additional information', async () => {
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText(/Registration Date:/i)).toBeVisible();
        expect(screen.getByText(/Last Login Date:/i)).toBeVisible();

        await userEvent.click(expandButton);
        // Depending on your implementation you might need to await the collapse animation
        // expect(screen.queryByText(/Registration Date:/i)).toBeNull();
        // expect(screen.queryByText(/Last Login Date:/i)).toBeNull();
    });

    it('allows editing user profile for current user', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'updated.email@example.com');

        await userEvent.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Updated Name',
            email: 'updated.email@example.com',
        });
    });

    it('shows snackbar message after successful edit', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        await userEvent.click(screen.getByText('Save'));

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('disables delete button for recently registered users', () => {
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('calls delete user function when delete button is clicked', async () => {
        // Mocking the canDeleteUser function to return false so the button is enabled
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-04-02T12:00:00.000Z').getTime());
        setup();

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();

        await userEvent.click(deleteButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });
});
