export type FileNodeComponent = {
    value: string,
    children?: FileNodeComponent[],
}

export function FolderTreeComponent(props: { node: FileNodeComponent, depth: number }) {
  const { node, depth } = props;
  return (
      <>
      <div style={{ borderLeft: "1px solid black", margin: "5px 5px" }}>
        <div style={{ paddingLeft: `5px` }} >
          {node.value}
          {node.children?.map((child_node) => (
            <FolderTreeComponent key={child_node.value} node={child_node} depth={depth + 1}/>
          ))}
        </div>
      </div>
    </>
  )
}