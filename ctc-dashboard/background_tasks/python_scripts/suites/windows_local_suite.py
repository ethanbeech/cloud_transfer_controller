from pathlib import Path
from .tree_classes import FileNode

import ctypes
import os
import stat

def create_initial_node(root_directory):
    base_directory = Path.home().joinpath(root_directory)
    base_node = FileNode(str(base_directory.resolve()), base_directory.name, base_directory.suffix)
    return base_node

def has_system_attribute(folder_path):
    try:
        attrs = ctypes.windll.kernel32.GetFileAttributesW(folder_path)
        return attrs != -1 and attrs & 0x4  # Check for FILE_ATTRIBUTE_SYSTEM
    except OSError:
        return False

def build_file_directory(base_node: FileNode):
    current_Path = Path(base_node.file_id)
    for child in current_Path.iterdir():
        if "Coding" in child.name or "_env" in child.name:
            continue

        # Filter out operating system crticial files
        if has_system_attribute(str(child)):
            continue

        info = os.stat(child)

        if not (info.st_file_attributes & stat.FILE_ATTRIBUTE_HIDDEN):
            child_node = FileNode(str(child.resolve()), child.name, child.suffix)
            if child.is_dir():
                child_node = build_file_directory(child_node)
            base_node.children.add(child_node)
    return base_node