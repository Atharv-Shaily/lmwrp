import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@/components/Layout';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
        <ToastContainer position="top-right" autoClose={3000} />
      </Layout>
    </SessionProvider>
  );
}






