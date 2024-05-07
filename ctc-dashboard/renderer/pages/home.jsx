import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function HomePage() {

	let google_connection = false;
	let office_connection = false;
	let dropbox_connection = true;
	let local_connection = true;
	const connection_succeeded_colour = "success";
	const connection_failed_colour = "danger"

	return (
		<React.Fragment>
			<Head>
				<title>Cloud Transfer Controller</title>
			</Head>
			<div className='card d-flex flex-column mx-auto align-items-center' style={{ width: "25rem" }}>
				<h4 >Cloud Transfer Controller</h4>

				<div className="w-75 m-3">
					<div className="row border align-items-space-between rounded-top overflow-hidden">
						<div className="col">Google Drive</div>
						<div className={`col-2 bg-${google_connection ? connection_succeeded_colour : connection_failed_colour}`}></div>
					</div>
					<div className="row border align-items-space-between overflow-hidden">
						<div className="col">Office 365</div>
						<div className={`col-2 bg-${office_connection ? connection_succeeded_colour : connection_failed_colour}`}></div>
					</div>
					<div className="row border align-items-space-between overflow-hidden">
						<div className="col">Dropbox</div>
						<div className={`col-2 bg-${dropbox_connection ? connection_succeeded_colour : connection_failed_colour}`}></div>
					</div>
					<div className="row border align-items-space-between rounded-bottom overflow-hidden">
						<div className="col">Local Drive</div>
						<div className={`col-2 bg-${local_connection ? connection_succeeded_colour : connection_failed_colour}`}></div>
					</div>
				</div>

				<div className="container m-2">
				<Link href="/dashboard/dashboard">
					<div className='btn btn-primary'>Continue to dashboard</div>
				</Link>
				</div>
			</div>
		</React.Fragment>
	)
}
