import { useState } from "react";

import { IoMdFolder } from "react-icons/io";
import { IoDocumentOutline } from "react-icons/io5";
import { IoFolderOpen } from "react-icons/io5";

import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { DraggableItemTypes } from "./constants";

export type FileNodeComponent = {
    value: string,
    children?: FileNodeComponent[],
}

function getParentFilePathAndName(filePath: string) {
  const parts = filePath.split(/\\{2,}/);

  return parts.slice(0, -1).join('\\')
}

export function FolderTreeComponent(props: { node: FileNode, depth: number, currentPath: string[], pass_key: string, baseNode: FileNode, setBaseNode}) {
  let { node, depth, currentPath, pass_key, baseNode, setBaseNode } = props;

  function moveFile({movedFile_originalTree, newParentNode_originalTree}) {
    const movedFilePath = movedFile_originalTree.file_id
    const baseFilePath = baseNode.file_id
    const newParentFilePath = newParentNode_originalTree.file_id

    if (!movedFilePath.startsWith(baseFilePath)) {
      console.log("ERROR ctc_001: inconsistent base file path")
      return
    }

    // Find parent node
    let relativeFilePath = movedFilePath.replace(baseFilePath, "").slice(1)
    let path_steps = relativeFilePath.split("\\")
    const file_id_end = path_steps.pop()

    // Create shallow copy of the base node to trigger re-render when setting state later
    let baseNode_copy = { ...baseNode }
    let parentNode = baseNode_copy;
    let target_id = baseNode_copy.file_id
    for (const step of path_steps) {
      target_id += "\\"
      target_id += step
      for (const child_node of parentNode.children) {
        if (child_node.file_id == target_id) {
          parentNode = child_node
          break
        }
      }
    }

    // Remove node from old parent
    const index = parentNode.children.findIndex((child) => child.file_id === movedFilePath);

    let removedFileNode

    if (index !== -1) {
      removedFileNode = parentNode.children.splice(index, 1)
    } else {
      console.log("ERROR ctc_002: Moved file's file ID not found")
      console.log(`Cannot remove: ${movedFilePath}`)
      return
    }

    // Find new parent node
    relativeFilePath = newParentFilePath.replace(baseFilePath, "").slice(1)
    path_steps = relativeFilePath.split("\\")

    let newParentNode = baseNode_copy;
    target_id = baseNode_copy.file_id
    for (const step of path_steps) {
      target_id += "\\"
      target_id += step
      for (const child_node of parentNode.children) {
        if (child_node.file_id == target_id) {
          newParentNode = child_node
          break
        }
      }
    }

    // Add moved node to new parent node's children
    removedFileNode.file_id = newParentNode.file_id + "\\" + file_id_end
    newParentNode.children.push(removedFileNode[0])
    console.log(newParentNode.file_id)

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

  // Stop base directory from being draggable and clickable
  const ref_value = (depth == 0) ? (node) => drop(node) : (node) => drag(drop(node))

  let child_counter = 0;

  const generate_child_key = () => {
    child_counter++;  
    return (pass_key + "_" + Math.floor(child_counter / 2).toString());
  }

  const handleToggleChildren = (depth == 0) ? null : 
  (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowChildren(!show_children);
  }

  return (
      <div style={{ borderLeft: "1px solid black" }} onClick={handleToggleChildren}>
        <div style={{ paddingLeft: `5px` }} >
          <div ref={ref_value} style={{ display: "flex", alignItems: "center", padding: "2px 0 2px 10px"}}>
            {node.file_extension == null ? 
            (show_children? <IoFolderOpen/> : <IoMdFolder/>) : <IoDocumentOutline />}
            <span style={{ paddingLeft: "5px" }}>{node.file_id}</span>
          </div>
          {show_children &&
            <ul>
              { node.children?.map((child_node) => (
                <li className="px-4 py-2 bg-gray-200 text-sm font-semibold">
                <FolderTreeComponent key={generate_child_key()} node={child_node} depth={depth + 1} currentPath={[child_node.file_id]} pass_key={generate_child_key()} 
                baseNode={baseNode} setBaseNode={setBaseNode}/>
                </li>
              ))
              }
            </ul>
          }
        </div>
      </div>
  )
}

// TODO: fix children keys