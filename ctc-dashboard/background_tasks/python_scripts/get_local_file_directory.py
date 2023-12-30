from suites.windows_local_suite import *
import sys

if __name__ == "__main__":
    base_file_path = sys.argv[1]

    base_node = create_initial_node(base_file_path)
    base_node = build_file_directory(base_node)
    print(base_node.jsonify())

