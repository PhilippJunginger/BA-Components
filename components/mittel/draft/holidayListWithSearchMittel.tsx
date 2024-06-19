import { useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import useGetHolidayList from '../../hooks/useGetHolidayList';
import { useRouter } from 'next/router';

export default function HolidayListWithSearchMittel() {
    const { holidays, isError, isLoading } = useGetHolidayList();
    const [search, setSearch] = useState<string>('');
    const router = useRouter();
    const countryQuery = router.query.country as string;

    const holidaysMatchingSearch =
        holidays?.filter(
            (holiday) =>
                holiday.name.substring(0, search.length).toLowerCase().includes(search.toLowerCase()) &&
                holiday.country === countryQuery,
        ) ?? [];

    const handleOnChange = (value: string) => {
        setSearch(value);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField value={search} label={'Search by Name'} onChange={(e) => handleOnChange(e.target.value)} />

            {isError && <Alert severity={'error'}>Es ist ein Fehler aufgetreten!</Alert>}

            {isLoading ? (
                <CircularProgress sx={{ mx: 'auto', mt: 5 }} />
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Day</TableCell>
                            <TableCell>Type</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {holidaysMatchingSearch.map((holiday, index) => (
                            <TableRow key={holiday.country + index}>
                                <TableCell>{holiday.name}</TableCell>
                                <TableCell>{holiday.date}</TableCell>
                                <TableCell>{holiday.day}</TableCell>
                                <TableCell>{holiday.type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Box>
    );
}
