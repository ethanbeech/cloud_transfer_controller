import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
export default function NextPage() {

  return (
    <React.Fragment>
      <Head>
        <title>Next - Nextron (basic-lang-javascript)</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -
          <Link href="/home">
            <a>Go to home page</a>
          </Link>
        </p>
      </div>
    </React.Fragment>
  )
}
