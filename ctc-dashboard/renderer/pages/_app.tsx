// pages/_app.js or pages/_app.tsx

import { AppProps } from 'next/app';
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    require("bootstrap/dist/css/bootstrap.min.css");
  }, []);
  return <Component {...pageProps} />;
}

export default MyApp;