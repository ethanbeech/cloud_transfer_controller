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

function moveFile({movedFile, oldParentNode, newParentNode}) {
  console.log(movedFile, oldParentNode, newParentNode);
  oldParentNode.children = null
}

export function FolderTreeComponent(props: { node: FileNode, depth: number, parentNode?: FileNode | null, nodeDictionary: {[key: string]: any} }) {
  let { node, depth, parentNode, nodeDictionary } = props;
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
        movedFile: droppedNode,
        oldParentNode: parentNode,
        newParentNode: node, 
      }),
      collect: (monitor: DropTargetMonitor) => ({
        isOver: !!monitor.isOver()
      })
    }),
    []
  )

  // Stop base directory from being draggable and clickable
  const ref_value = (depth == 0) ? (node) => drop(node) : (node) => drag(drop(node))

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
                <FolderTreeComponent key={child_node.file_id} node={child_node} depth={depth + 1} parentNode={node} nodeDictionary={nodeDictionary}/>
                </li>
              ))
              }
            </ul>
          }
        </div>
      </div>
  )
}

// TODO: get drop to interact with dictionary and relocate all the children from the original parent to the new one