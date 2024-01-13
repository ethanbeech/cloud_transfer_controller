// pages/_app.js or pages/_app.tsx

import './styles.css'; // Import your global CSS file
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;