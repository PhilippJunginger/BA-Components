import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";



export default function App({ Component, pageProps }: AppProps) {
  return <AppRouterCacheProvider><Component {...pageProps} /></AppRouterCacheProvider>;
}
