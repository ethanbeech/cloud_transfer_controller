from typing import List


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