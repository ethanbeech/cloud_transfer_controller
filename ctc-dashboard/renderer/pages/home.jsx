import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Cloud Transfer Controller</title>
      </Head>
      <div>
        Welcome to the Cloud Transfer Controller

        <Link href="/dashboard/dashboard">
          <div>Continue to dashboard</div>
        </Link>
      </div>
    </React.Fragment>
  )
}
