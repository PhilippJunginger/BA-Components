import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

type UserDTO = {
    name: {
        title: string;
        first: string;
        last: string;
    };
    email: string;
    phone: string;
};

type UserApiResponse = {
    results: UserDTO[];
};

export default function UserProfile() {
    const [user, setUser] = useState<UserDTO | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            setIsLoading(true);
            try {
                const response = await fetch(`https://randomuser.me/api/?inc=name,email,phone`);
                if (!response.ok) {
                    return new Error('Network response was not ok');
                }
                const data: UserApiResponse = await response.json();
                setUser(data.results[0]);
            } catch (error) {
                setError((error as unknown as Error).message);
            } finally {
                setIsLoading(false);
            }
        }

        void fetchUser();
    }, []);

    if (isLoading) {
        return <Box>Loading....</Box>;
    }

    if (error) {
        return <Box>Error: {error}</Box>;
    }
    if (!user) {
        return <Box>No user found</Box>;
    }

    return (
        <Box>
            <Typography typography={'h4'}>
                {user.name.title} {user.name.first} {user.name.last}
            </Typography>
            <Typography typography={'p'}>Email: {user.email}</Typography>
            <Typography typography={'p'}>Phone: {user.phone}</Typography>
        </Box>
    );
}
