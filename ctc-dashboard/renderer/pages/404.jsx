import React from 'react'
import Link from 'next/link'

const Custom404 = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link href="/home">Return to homepage</Link>
    </div>
  );
};

export default Custom404;

