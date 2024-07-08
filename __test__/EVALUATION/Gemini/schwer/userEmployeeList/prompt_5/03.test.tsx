import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- fireEvent
- userEvent
- mocking query instead of fetch
- missing assertion

- unused imports - 2
- not needed import - 2
- usage of not needed imports
- before* outside of describe

- 1 von 12 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -50
CleanCode: -30
Testumfang: 4,15
 */

// Mock data
const mockUsers: UserNoPw[] = [
    // ... your user data (Admins, Employees) ...
];

// Mock fetch using Mock Service Worker (MSW)
const server = setupServer(
    rest.get('http://localhost:8080/users', (req, res, ctx) => {
        return res(ctx.json(mockUsers));
    }),
    rest.post('http://localhost:8080/user', (req, res, ctx) => {
        return res(ctx.status(200));
    }),
);

// Enable API mocking before all tests
beforeAll(() => server.listen());
// Reset any request handlers that are declared as a part of our tests
afterEach(() => server.resetHandlers());
// Clean up once the tests are done
afterAll(() => server.close());

// jest.mock to mock the implementation of useQuery
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn().mockReturnValue({
        isLoading: false,
        error: null,
        data: mockUsers,
        refetch: jest.fn(),
    }),
}));

describe('UserEmployeeListSchwer', () => {
    it('renders user list correctly', async () => {
        render(<UserEmployeeListSchwer />);

        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });
    });

    it('filters users by role correctly', async () => {
        render(<UserEmployeeListSchwer />);

        // Filter by employees
        fireEvent.change(screen.getByLabelText('Filter by Role'), {
            target: { value: USER_ROLE.EMPLOYEE },
        });

        await waitFor(() => {
            // ... assert that only employees are shown
        });
    });

    // ... more tests for search, sort, pagination, icons, edit/delete, error states, snackbar ...
});
