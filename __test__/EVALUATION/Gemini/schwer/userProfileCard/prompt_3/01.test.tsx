import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- userEvent
- fireEvent
- interface usage
- node access
- conidtion in test

- variable - 6
- unnecessary module import
- typeerror - 2
- render Funktion
- props spreading

- 6 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -60
CleanCode: -55
Testumfang: 49,95
 */

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-10T10:00:00.000Z',
    lastLoginDate: '2023-03-15T12:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const mockRouter = {
    push: jest.fn(),
};

jest.mock('next/router', () => ({
    useRouter: () => mockRouter,
}));

const renderComponent = (props?: any) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: mockCurrentUser,
    };

    render(
        <BrowserRouter>
            <UserProfileCardSchwer {...defaultProps} {...props} />
        </BrowserRouter>,
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

    it('expands and collapses additional information', () => {
        renderComponent();

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 10/03/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 15/03/2023')).toBeVisible();

        fireEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 10/03/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 15/03/2023')).not.toBeVisible();
    });

    it('navigates to the profile page', () => {
        renderComponent();

        const profilePageButton = screen.getByText('Show Profile Page');
        fireEvent.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    describe('Edit Mode', () => {
        it('toggles edit mode', () => {
            renderComponent();

            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();

            fireEvent.click(editButton);

            expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
            expect(screen.queryByText('Change Profile Picture')).not.toBeInTheDocument();
        });

        it('updates user profile', () => {
            renderComponent();

            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            const nameInput = screen.getByLabelText('Name');
            const emailInput = screen.getByLabelText('Email');

            fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
            fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });

            fireEvent.click(editButton);

            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        it('uploads a new profile image', async () => {
            const mockFetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
                }),
            );

            global.fetch = mockFetch;

            renderComponent();

            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
            const file = new File(['(mock image data)'], 'profile-image.jpg', { type: 'image/jpeg' });

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [file] } });
            }

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
                method: 'POST',
                body: expect.any(FormData),
            });

            fireEvent.click(editButton);

            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'https://example.com/new-profile-image.jpg',
            });
        });

        it('shows error message for invalid image upload', async () => {
            const mockFetch = jest.fn(() => Promise.reject(new Error('Failed to upload image')));

            global.fetch = mockFetch;

            renderComponent();

            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
            const file = new File(['(mock image data)'], 'profile-image.jpg', { type: 'image/jpeg' });

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [file] } });
            }

            expect(screen.getByText('Failed to upload image')).toBeVisible();
        });
    });

    describe('Delete User', () => {
        it('deletes user', async () => {
            const mockFetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                }),
            );

            global.fetch = mockFetch;
            global.confirm = jest.fn(() => true);

            renderComponent();

            const deleteButton = screen.getByText('Delete User');
            fireEvent.click(deleteButton);

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
                method: 'POST',
                body: JSON.stringify({ userId: '1' }),
            });

            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        it('shows error message when deleting user fails', async () => {
            const mockFetch = jest.fn(() => Promise.reject(new Error('Failed to delete user')));

            global.fetch = mockFetch;
            global.confirm = jest.fn(() => true);

            renderComponent();

            const deleteButton = screen.getByText('Delete User');
            fireEvent.click(deleteButton);

            expect(screen.getByText('Failed to delete user')).toBeVisible();
        });
    });
});
