import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises
- interface usage
- prefer await findBy

- unnecessary let declaration
- variable - 2
- props spreading
- unnecessary waitFor - 2

- 4 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -40
CleanCode: -30
Testumfang: 38,85
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = useRouter as jest.Mock;

describe('UserProfileCardSchwer', () => {
    let defaultProps: any;

    beforeEach(() => {
        defaultProps = {
            userProfile: {
                id: '1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                profileImageUrl: 'https://example.com/profile.jpg',
                registrationDate: new Date().toISOString(),
                lastLoginDate: new Date().toISOString(),
            },
            setUserProfile: jest.fn(),
            currentUser: {
                id: '1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'password123',
            },
        };

        mockRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders user profile card', () => {
        render(<UserProfileCardSchwer {...defaultProps} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it.skip('saves edited user profile', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);
        await userEvent.click(screen.getByText('Edit'));
        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));
        expect(defaultProps.setUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('handles image upload', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);
        await userEvent.click(screen.getByText('Edit'));
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);
        expect(await screen.findByText('User edited successfully')).toBeInTheDocument();
    });

    it('navigates to profile page', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);
        await userEvent.click(screen.getByLabelText('show more'));
        await userEvent.click(screen.getByText('Show Profile Page'));
        await waitFor(() => expect(mockRouter().push).toHaveBeenCalledWith('http://localhost:3000/user?id=1'));
    });

    it.skip('handles delete user', async () => {
        window.confirm = jest.fn().mockImplementation(() => true);
        render(<UserProfileCardSchwer {...defaultProps} />);
        await userEvent.click(screen.getByText('Delete User'));
        await waitFor(() => expect(defaultProps.setUserProfile).toHaveBeenCalledWith(undefined));
        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });

    it.skip('closes snackbar', async () => {
        render(<UserProfileCardSchwer {...defaultProps} />);
        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));
        await userEvent.click(screen.getByLabelText('close'));
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
