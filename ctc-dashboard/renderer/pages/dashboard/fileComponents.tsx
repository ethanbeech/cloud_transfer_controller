import { useState } from "react";

import { IoMdFolder } from "react-icons/io";
import { IoDocumentOutline } from "react-icons/io5";
import { IoFolderOpen } from "react-icons/io5";

import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { DraggableItemTypes } from "./constants";
import { relative } from "path";

import { v4 as uuidv4 } from 'uuid';

export type FileNodeComponent = {
    value: string,
    children?: FileNodeComponent[],
}

function getParentFilePathAndName(filePath: string) {
    const parts = filePath.split(/\\{2,}/);

    return parts.slice(0, -1).join('\\')
}

export function FolderTreeComponent(props: { node: FileNode, depth: number, currentPath: string, baseNode: FileNode, setBaseNode, setActionLog }) {
    let { node, depth, currentPath, baseNode, setBaseNode, setActionLog } = props;

    function moveFile({ movedFile_originalTree, newParentNode_originalTree }) {
        const movedFilePath = movedFile_originalTree.current_path
        const baseFilePath = baseNode.current_path
        const newParentFilePath = newParentNode_originalTree.current_path

        console.log(movedFilePath);
        console.log(newParentFilePath);

        if (!movedFilePath.startsWith(baseFilePath)) {
            console.log("ERROR ctc_001: inconsistent base file path")
            return
        }

        // Find parent node
        let relativeFilePath = movedFilePath.replace(baseFilePath, "").slice(1)
        let path_steps = relativeFilePath.split("\\")
        const current_path_end = path_steps.pop()

        // Create shallow copy of the base node to trigger re-render when setting state later
        let baseNode_copy = { ...baseNode }
        let parentNode = baseNode_copy;
        let target_id = baseNode_copy.current_path
        for (const step of path_steps) {
            target_id += "\\"
            target_id += step
            for (const child_node of parentNode.children) {
                if (child_node.current_path == target_id) {
                    parentNode = child_node
                    break
                }
            }
        }

        // Remove node from old parent
        const index = parentNode.children.findIndex((child) => child.current_path === movedFilePath);

        let removedFileNode

        if (index !== -1) {
            removedFileNode = parentNode.children.splice(index, 1)[0]
        } else {
            console.log("ERROR ctc_002: Moved file's file ID not found")
            console.log(`Cannot remove: ${movedFilePath}`)
            return
        }

        // Find new parent node
        relativeFilePath = newParentFilePath.replace(baseFilePath, "").slice(1)
        path_steps = relativeFilePath.split("\\")

        let newParentNode = baseNode_copy;
        target_id = baseNode_copy.current_path
        for (const step of path_steps) {
            target_id += "\\"
            target_id += step
            for (const child_node of newParentNode.children) {
                if (child_node.current_path == target_id) {
                    newParentNode = child_node
                    break
                }
            }
        }

        // Add moved node to new parent node's children
        // ensuring no error if parent node's original children attribute is null
        removedFileNode.current_path = newParentNode.current_path + "\\" + current_path_end
        if (newParentNode.children != null) {
            newParentNode.children.push(removedFileNode)
        } else {
            newParentNode.children = [removedFileNode];
        }

        // Update action log
        setActionLog(prevActionLog => (
            {
                ...prevActionLog,
                [removedFileNode.file_id]: newParentNode.file_id
            }))

        // Set state to update the base node and thus the tree
        setBaseNode(baseNode_copy)
    }

    // Only show default for base node by default
    const [show_children, setShowChildren] = useState(depth == 0);

    // Define how draggable components work
    const [{ isDragging }, drag] = useDrag(() => ({
        type: DraggableItemTypes.FILE,
        item: node,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }))

    // Define how the receiving (dropped on) component works
    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: DraggableItemTypes.FILE,
            drop: (droppedNode) => moveFile({
                movedFile_originalTree: droppedNode,
                newParentNode_originalTree: node,
            }),
            collect: (monitor: DropTargetMonitor) => ({
                isOver: !!monitor.isOver()
            })
        }),
        []
    )

    // Apply drag and drop rules
    let ref_value;
    if (depth == 0) {
        // Stop base directory from being draggable and clickable
        ref_value = (node) => drop(node)
    } else if (node.file_extension === null) {
        // Shouldn't be able to drop onto files
        ref_value = (node) => drag(drop(node))
    } else {
        ref_value = (node) => drag(node)
    }
    // const ref_value = (depth == 0) ? (node) => drop(node) : (node) => drag(drop(node))

    const handleToggleChildren = (depth == 0) ? null :
        (event: React.MouseEvent) => {
            event.stopPropagation();
            setShowChildren(!show_children);
        }

    return (
        <div onClick={handleToggleChildren} className="container-fluid m-0">
            <div ref={ref_value}>
              {node.file_extension === null ? 
              (show_children? <IoFolderOpen/> : <IoMdFolder/>) : <IoDocumentOutline />}
              <span style={{ paddingLeft: "5px" }}>{node.current_path}</span>
            </div>
            {show_children &&
              <div className="container-fluid border">
                { node.children?.map((child_node) => (
                    <FolderTreeComponent key={uuidv4()} node={child_node} depth={depth + 1} currentPath={child_node.current_path} 
                    baseNode={baseNode} setBaseNode={setBaseNode} setActionLog={setActionLog}/>
                ))
                }
              </div>
            }
        </div>
    )
}

// TODO: fix children keys
// TODO: Moving files to 'My Games' puts them under Documents instead