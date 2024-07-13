import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- missing describe

- typeerror - 1



- 1 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -5
Testumfang: 0
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://example.com/avatar.jpg',
    registrationDate: new Date('2023-01-01').toISOString(),
    lastLoginDate: new Date('2023-12-31').toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

test('renders user profile information', () => {
    render(
        <UserProfileCardMittel
            userProfile={mockUserProfile}
            setUserProfile={jest.fn()}
            currentUser={mockCurrentUser}
        />,
    );

    expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
    expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
});

test('expands and collapses additional details', async () => {
    render(
        <UserProfileCardMittel
            userProfile={mockUserProfile}
            setUserProfile={jest.fn()}
            currentUser={mockCurrentUser}
        />,
    );

    // Initially, details are collapsed
    expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();

    // Expand details
    const expandButton = screen.getByRole('button', { name: 'show more' });
    await userEvent.click(expandButton);

    // Details are now visible
    expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();

    // Collapse details
    await userEvent.click(expandButton);

    // Details are hidden again
    expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
});

test.skip('renders dates in the correct format', async () => {
    render(
        <UserProfileCardMittel
            userProfile={mockUserProfile}
            setUserProfile={jest.fn()}
            currentUser={mockCurrentUser}
        />,
    );
    const expandButton = screen.getByRole('button', { name: 'show more' });
    await userEvent.click(expandButton);
    // Check that the dates are displayed in the expected format (e.g., '1/1/2023')
    expect(screen.getByText(new Date(mockUserProfile.registrationDate).toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(new Date(mockUserProfile.lastLoginDate).toLocaleDateString())).toBeInTheDocument();
});
