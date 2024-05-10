import Link from 'next/link'
import { FolderTreeComponent } from './fileComponents'
import { useEffect, useState } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { v4 as uuidv4 } from 'uuid';

export default function DashboardPage() {
	// Setup inter-process communication
	useEffect(() => {
		// Receiving a file directory in json format
		// @ts-ignore
		window.electronAPI.receiveFileDirectory(
			(status, cloudService, fileDirectoryJSON) => {
				console.log(status)
				if (status) {
					const setBaseNode = setBaseNodeCalls[cloudService];
					// @ts-ignore
					const newBaseNode = window.fileClasses.createFileNode(fileDirectoryJSON);
					setBaseNode(newBaseNode);
				}
			}
		)

		// @ts-ignore
		window.electronAPI.getLocalFileDirectory();
		// @ts-ignore
		window.electronAPI.getGoogleFileDirectory();
	}, [])

	// Logic begins here
	// @ts-ignore
	const [localBaseNode, setLocalBaseNode] = useState(window.fileClasses.createFileNode({
		file_id: "Results loading",
		file_title: "empty",
		file_extension: "null",
}));
	

	// @ts-ignore
	const [googleBaseNode, setGoogleBaseNode] = useState(window.fileClasses.createFileNode({
		file_id: "Results loading",
		file_title: "empty",
		file_extension: "null",
	}))

	const setBaseNodeCalls = {
		'local': setLocalBaseNode,
		'google': setGoogleBaseNode
	}

	const [actionLog, setActionLog] = useState({})

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="container-fluid d-flex flex-column border" style={{ minHeight: '100vh' }}>
				{/* Local file directory */}
				<FolderTreeComponent
					key={uuidv4()}
					node={localBaseNode}
					depth={0}
					currentPath={localBaseNode.file_id}
					baseNode={localBaseNode}
					setBaseNode={setLocalBaseNode}
					setActionLog={setActionLog}
				/>

				{/* Google file directory */}
				<FolderTreeComponent
					key={uuidv4()}
					node={googleBaseNode}
					depth={0}
					currentPath={googleBaseNode.file_id}
					baseNode={googleBaseNode}
					setBaseNode={setGoogleBaseNode}
					setActionLog={setActionLog}
				/>

				<div className="mt-auto"> {/* Navigation Bar */}
					<div className="m-2">
						<Link href="/home">
							<div className="btn btn-primary">Go to home page</div>
						</Link>
					</div>
				</div>
			</div>
		</DndProvider>
	)
}