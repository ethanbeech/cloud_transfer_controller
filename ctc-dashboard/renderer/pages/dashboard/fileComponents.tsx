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

function moveFile(movedFile, oldParentFile, newParentFile) {
  console.log(movedFile, oldParentFile, newParentFile);
  console.log("-_-") 
}

export function FolderTreeComponent(props: { node: FileNode, depth: number }) {
  const { node, depth } = props;
  const [show_children, set_show_children] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: DraggableItemTypes.FILE,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }))

  // Continue here
  // "ee? The drop method has the props of the Boar"
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: DraggableItemTypes.FILE,
      drop: (monitor: DropTargetMonitor) => moveFile(monitor.getItem(), monitor.getItem(), node),
      collect: (monitor: DropTargetMonitor) => ({
        isOver: !!monitor.isOver()
      })
    }),
    []
  )

  const handleToggleChildren = (event: React.MouseEvent) => {
    event.stopPropagation();
    set_show_children(!show_children);
  }
  return (
      <div style={{ borderLeft: "1px solid black", padding: "3px 5px" }} onClick={handleToggleChildren}>
        <div style={{ paddingLeft: `5px` }} >
          <div ref={(node) => drop(drag(node))} style={{ display: "flex", alignItems: "center", paddingLeft: "5px" }}>
            {node.file_extension == null ? 
            (show_children? <IoFolderOpen/> : <IoMdFolder/>) : <IoDocumentOutline />}
            <span style={{ paddingLeft: "5px" }}>{node.file_id}</span>
          </div>
          {show_children &&
            <ul className="border-2 border-gray-300 rounded">
              { node.children?.map((child_node) => (
                <li className="px-4 py-2 bg-gray-200 text-sm font-semibold">
                <FolderTreeComponent key={child_node.file_id} node={child_node} depth={depth + 1}/>
                </li>
              ))
              }
            </ul>
          }
        </div>
      </div>
  )
}