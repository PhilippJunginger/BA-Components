import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promises
- render in beforeEach

- unnecessary mocks - 2
- variable -1
- component definition missing - 2

- 3 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -25
Testumfang: 50
 */

// Mock icons to prevent rendering issues in tests
jest.mock('@mui/icons-material/ExpandMoreIcon', () => () => <div>ExpandMoreIcon</div>);
jest.mock('@mui/icons-material/CloseIcon', () => () => <div>CloseIcon</div>);

describe('UserProfileCardLeicht', () => {
    const userProfile: UserProfile = {
        id: '123',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date('2023-01-15'), // Registered over 24 hours ago
        lastLoginDate: new Date('2024-07-08'),
    };
    const currentUser: UserWithId = { ...userProfile, password: 'password123' };
    const setUserProfile = jest.fn();

    beforeEach(() => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                currentUser={currentUser}
                setUserProfile={setUserProfile}
            />,
        );
    });

    it('renders user profile information correctly', () => {
        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', userProfile.profileImageUrl);
    });

    it('expands and collapses additional details', async () => {
        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(
            screen.getByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(userProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const saveButton = screen.getByText('Save');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Alice Smith');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'alice.smith@example.com');

        await userEvent.click(saveButton);

        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Alice Smith',
            email: 'alice.smith@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('disables delete button within 24 hours of registration', () => {
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('calls delete function when delete button is clicked (after 24 hours)', async () => {
        const modifiedUserProfile = { ...userProfile, registrationDate: new Date('2023-07-05') }; // Registered more than 24 hours ago
        render(
            <UserProfileCardLeicht
                userProfile={modifiedUserProfile}
                currentUser={currentUser}
                setUserProfile={setUserProfile}
            />,
        );
        const deleteButton = screen.getByText('Delete User');

        await userEvent.click(deleteButton);
        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });
});
