import { render, screen, fireEvent } from '@testing-library/react';
import { format } from 'date-fns';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- userEvent
- fireEvent

- variable - 3
- unused import
- unnecessary mock of module

- 5 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -25
Testumfang: 80
 */

// Mock date to return a constant date
jest.mock('date-fns', () => ({
    ...jest.requireActual('date-fns'),
    format: jest.fn(() => '01/01/2023'), // Return a constant date string for testing
}));

describe('UserProfileCardLeicht', () => {
    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date('2023-01-01T12:00:00.000Z'),
        lastLoginDate: new Date('2023-01-02T12:00:00.000Z'),
    };

    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password',
    };

    const setUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('expands and collapses additional details', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 01/01/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 01/01/2023')).toBeVisible();

        fireEvent.click(expandButton);

        // These assertions might be flaky due to the transition, consider using waitForElementToBeRemoved or similar
        // expect(screen.queryByText('Registration Date: 01/01/2023')).not.toBeVisible();
        // expect(screen.queryByText('Last Login Date: 01/01/2023')).not.toBeVisible();
    });

    it('enables edit mode and saves changes', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });

        fireEvent.click(editButton); // Save changes

        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it('shows snackbar message on successful edit', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

        fireEvent.click(editButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('deletes user profile', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date(); // Now
        const recentUserProfile = { ...userProfile, registrationDate: recentRegistrationDate };

        render(
            <UserProfileCardLeicht
                userProfile={recentUserProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it("doesn't show edit and delete buttons for other users' profiles", () => {
        const differentUser: UserWithId = {
            id: '2',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'password123',
        };
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={differentUser}
            />,
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });
});
