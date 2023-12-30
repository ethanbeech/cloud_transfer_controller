import Link from 'next/link'
import { FileNodeComponent, FolderTreeComponent } from './fileComponents'

export default function DashboardPage() {
    const node1: FileNodeComponent= {
        value: "node1",
        children: [
            {
                value: "node2",
                children: [
                    {
                        value: "node3",
                    },
                    {
                        value: "node4",
                    }
                ]
            },
            {
                value: "node5",
            }
        ]
    }
    
    // @ts-ignore
    window.electronAPI.getLocalFileDirectory()

    // @ts-ignore
    window.electronAPI.receiveLocalFileDirectory(
        (localFileDirectoryJSON) => {
            // TODO: Parse json string into file nodes
        }
    )

    return(
        <>
        <FolderTreeComponent node={node1} depth={0} />
        <Link href="/home">
            <a>Go to home page</a>
        </Link>
        </>
    )
}