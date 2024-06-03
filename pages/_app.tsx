import '../styles/globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import dynamic from 'next/dynamic';

const NoSSR = dynamic(() => import('./index'), { ssr: false });

export default function App() {
    return (
        <AppRouterCacheProvider>
            <NoSSR />
        </AppRouterCacheProvider>
    );
}
