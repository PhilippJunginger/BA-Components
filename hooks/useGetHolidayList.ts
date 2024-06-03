import { useQuery } from '@tanstack/react-query';

type Holiday = {
    country: string;
    iso: string;
    year: number;
    date: string;
    day: string;
    name: string;
    type: string;
};

export default function useGetHolidayList(): {
    holidays: Holiday[] | undefined;
    isLoading: boolean;
    isError: boolean;
} {
    const fetchData = async (url: string, options: RequestInit) => {
        return fetch(url, options)
            .then(async (res) => {
                if (res.status < 200 || res.status >= 300) {
                    const response = await res.json();
                    throw await response;
                }

                return await res.json();
            })
            .catch(async (err) => {
                throw err;
            });
    };

    const query = useQuery({
        queryKey: ['holidayList'],
        queryFn: () =>
            fetchData('\n' + 'https://api.api-ninjas.com/v1/holidays?country=germany&year=2024', {
                method: 'GET',
                headers: {
                    'X-Api-Key': import.meta.env.VITE_NINJA_API_KEY,
                },
            }),
    });

    return { holidays: query.data, isError: query.isError, isLoading: query.isPending };
}
