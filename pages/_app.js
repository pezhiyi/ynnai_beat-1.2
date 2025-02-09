import Head from 'next/head';
import '../styles/globals.css';
import '../styles/globals/moveable.css';
import '../styles/modules/edit/modal.css';
import '../styles/modules/components/ai-portrait-modal.css';
import ErrorBoundary from '../components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
        />
        <link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/images/favicon-96x96.png" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <link rel="manifest" href="/images/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="background-color" content="#ffffff" />
      </Head>
      <div className="background-container" />
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
    </>
  );
}