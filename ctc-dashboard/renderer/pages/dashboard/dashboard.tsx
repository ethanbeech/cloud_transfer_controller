import Link from 'next/link'
import { FolderTreeComponent } from './fileComponents'
import { useEffect, useState } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { v4 as uuidv4 } from 'uuid';

export default function DashboardPage() {
	// Setup inter-process communication
	useEffect(() => {
		// @ts-ignore
		window.electronAPI.receiveLocalFileDirectory(
			(localFileDirectoryJSON) => {
				// @ts-ignore
				const newBaseNode = window.fileClasses.createFileNode(localFileDirectoryJSON);
				setBaseNode(newBaseNode);
			}
		)

		// @ts-ignore
		window.electronAPI.getLocalFileDirectory()
	}, [])

	// Logic begins here
	// @ts-ignore
	const [baseNode, setBaseNode] = useState(window.fileClasses.createFileNode({
		file_id: "Results loading",
		file_title: "empty",
		file_extension: "null",
	}))

	const [actionLog, setActionLog] = useState({})

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="container-fluid d-flex flex-column border" style={{ minHeight: '100vh' }}>
				<FolderTreeComponent
					key={uuidv4()}
					node={baseNode}
					depth={0}
					currentPath={baseNode.file_id}
					baseNode={baseNode}
					setBaseNode={setBaseNode}
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