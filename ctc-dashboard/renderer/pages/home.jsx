import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function HomePage() {
	const [cloudConnections, setCloudConnections] = useState({
		"googleConnection": 'connection_pending',
		"oneDriveConnection": 'connection_pending',
		"dropboxConnection": 'connection_pending',
		"localConnection": 'connection_pending'
	});

	const cloudConnectionColourMap = {
		'connection_success': 'success',
		'connection_failed': 'danger',
		'connection_pending': 'warning'
	};

	// Check connection statuses
	useEffect(() => {
		// @ts-ignore
		window.electronAPI.receiveCloudConnectionStatus(
			(cloudService, connectionStatus) => {
				let connectionStatusString
				if (connectionStatus) {
					connectionStatusString = 'connection_success';
				} else {
					connectionStatusString = 'connection_failed';
				}
				setCloudConnections(previousCloudConnections => ({
					...previousCloudConnections,
					[cloudService]: connectionStatusString
				}))
			}
		)

		// @ts-ignore
		window.electronAPI.getCloudConnectionStatuses()
	}, []);

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
						<div className={`col-2 bg-${cloudConnectionColourMap[cloudConnections["googleConnection"]]}`}></div>
					</div>
					<div className="row border align-items-space-between overflow-hidden">
						<div className="col">OneDrive Connection</div>
						<div className={`col-2 bg-${cloudConnectionColourMap[cloudConnections["oneDriveConnection"]]}`}></div>
					</div>
					<div className="row border align-items-space-between overflow-hidden">
						<div className="col">Dropbox</div>
						<div className={`col-2 bg-${cloudConnectionColourMap[cloudConnections["dropboxConnection"]]}`}></div>
					</div>
					<div className="row border align-items-space-between rounded-bottom overflow-hidden">
						<div className="col">Local Drive</div>
						<div className={`col-2 bg-${cloudConnectionColourMap[cloudConnections["localConnection"]]}`}></div>
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
