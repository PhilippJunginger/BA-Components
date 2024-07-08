import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';
import { router } from 'next/client';

/*
- render in beforeEach

- enum
- vairablen - 8
- typeerror

- 6 von 10 notwendigen Testfälen erreicht + 1 A + 1 Redundanz


Best-Practices: -10
CleanCode: -50
Testumfang: 55
 */

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
    });

    it('should display fetched users', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should filter users by search term', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        const sortByNameRadio = screen.getByLabelText('Name');
        await user.click(sortByNameRadio);
        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('Jane Smith');
        expect(userList[1]).toHaveTextContent('John Doe');
    });

    it('should sort users by email', async () => {
        const sortByEmailRadio = screen.getByLabelText('Email');
        await user.click(sortByEmailRadio);
        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('John Doe');
        expect(userList[1]).toHaveTextContent('Jane Smith');
    });

    it('should filter users by role', async () => {
        const filterSelect = screen.getByLabelText('Filter by Role');
        await user.click(filterSelect);
        await user.click(screen.getByRole('option', { name: 'EMPLOYEE' }));
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should navigate to edit user page on edit button click', async () => {
        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);
        expect(router.push).toHaveBeenCalledWith('/edit/John Doe');
    });

    it('should remove user from list on delete button click', async () => {
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should paginate users', async () => {
        const pagination = screen.getByRole('button', { name: '2' });
        await user.click(pagination);
        // Assuming more users to be added to the fetchedUsers array for pagination
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
});
