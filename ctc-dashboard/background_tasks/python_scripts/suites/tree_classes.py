from typing import List
from collections import deque
import json

class FileNode:
    def __init__(self, file_id, file_title, file_extension):
        """
        Paramaters:
        file_id: the unique id needed by the drive service
        file_title: the readable name given to the file
        Attributes:
        file_id: the unique id needed by the drive service
        file_title: the readable name given to the file
        children: a set of current child File objects
        """
        self.file_id = file_id
        self.current_path = file_id
        self.file_title = file_title
        self.file_extension = file_extension
        self.children = set()

    def add_child(self, child_node):
        """
        Add children to the File node
        Parameters:
        children FileNode: Child FileNodes, only accepts single
        instance
        """

        self.children.add(child_node)
    
    def display_tree(self):
        queue = deque()
        queue.append(self)

        while queue:
            node = queue.popleft()

            print(node)
            for child in node.children:
                queue.append(child)

    def __str__(self):
        return self.file_title

    def jsonify(self):
        if not self.children:
            children_json = "null"
        else:
            children_json = "[" + ",".join([_child.jsonify() for _child in self.children]) + "]"
        file_id_val = self.file_id.replace("\\", "\\\\")
        file_title_val = self.file_title.replace('"', '\\"')
        if not self.file_extension:
            file_extension_val = "null"
        else:
            file_extension_val = f'"{self.file_extension}"'
        return(f'\u007b"file_id":"{file_id_val}","current_path":"{file_id_val}","file_title":"{file_title_val}","file_extension":{file_extension_val},"children":{children_json}\u007d')