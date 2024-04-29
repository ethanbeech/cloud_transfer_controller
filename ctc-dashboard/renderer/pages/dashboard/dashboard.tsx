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
            // TODO: Parse json string into file nodes
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

    return(
        <DndProvider backend={HTML5Backend}>
        <FolderTreeComponent key={uuidv4()} node={baseNode} depth={0} currentPath={baseNode.file_id} baseNode={baseNode} setBaseNode={setBaseNode}
        setActionLog={setActionLog}/>
        <Link href="/home">
            <a>Go to home page</a>
        </Link>
        </DndProvider>
    )
}