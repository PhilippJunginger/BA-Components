import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*

- enum
- vairablen - 4
- const missing

- 9 von 12 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: 0
CleanCode: -30
Tetumfang: 66,4
 */

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('UserEmployeeListSchwer Component', () => {
    const user = userEvent.setup();

    it('should display the correct title', () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should show entered value in the search input', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await user.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');
    });

    it('should change sort by selection', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        await user.click(screen.getByLabelText('Name'));
        expect(screen.getByLabelText('Name')).toBeChecked();
        await user.click(screen.getByLabelText('Email'));
        expect(screen.getByLabelText('Email')).toBeChecked();
    });

    it('should change role filter selection', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        await user.click(screen.getByLabelText('Filter by Role'));
        await user.click(screen.getByRole('option', { name: 'ADMIN' }));
        expect(screen.getByRole('button', { name: /Filter by Role/i })).toHaveTextContent('ADMIN');
    });

    it('should handle page change', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('navigation');
        await user.click(screen.getByLabelText('Go to next page'));
        expect(pagination).toBeInTheDocument();
    });

    it('should display snackbar message on error', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        // Simulate an error scenario (implementation depends on how errors are handled)
        await waitFor(() => {
            expect(screen.getByText('Deletion of user failed!')).toBeInTheDocument();
        });
    });

    it('should show filtered users based on search term', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await user.type(searchInput, 'John');
        // Simulate fetching and filtering users
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    it('should handle user deletion', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('should navigate to user edit page', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);
        await waitFor(() => {
            expect(mockedRouter.push).toHaveBeenCalledWith('/edit/JohnDoe');
        });
    });

    it('should display no users message when there are no users', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        // Simulate no users fetched
        await waitFor(() => {
            expect(screen.getByText('No Users created')).toBeInTheDocument();
        });
    });

    it('should display error message when fetching users fails', async () => {
        renderWithProviders(<UserEmployeeListSchwer />);
        // Simulate error in fetching users
        await waitFor(() => {
            expect(screen.getByText('An error occurred while retrieving users')).toBeInTheDocument();
        });
    });
});
