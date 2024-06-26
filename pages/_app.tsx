import '../styles/globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import dynamic from 'next/dynamic';
import React from 'react';

const NoSSR = dynamic(() => import('./index'), { ssr: false });

export default function App() {
    return (
        <AppRouterCacheProvider>
            <NoSSR />
        </AppRouterCacheProvider>
    );
}
