
from msilib.schema import Error
import os.path

from pathlib import Path

import google.auth.transport.requests
import requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from tree_classes import FileNode


SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

def authentication():
    creds = None

    if os.path.exists("suites/credentials/google_token.json"):
        creds = Credentials.from_authorized_user_file("suites/credentials/google_token.json", SCOPES)
    # Login if no valid credentials
    if not creds or not creds.valid:
        # Add here is token can be refreshed

        # Else generate new token from login details
        flow = InstalledAppFlow.from_client_secrets_file(
            "suites\credentials\google_credentials.json", SCOPES
        )
        creds = flow.run_local_server(port=0)
        # Save credentials for the next run
        with open("suites/credentials/google_token.json","w") as token:
            token.write(creds.to_json())

    return creds

def build_service(creds):
    return build("drive", "v3", credentials=creds)

def build_file_directory(service):
    """
    Builds a tree with nodes of each file or folder in the Google
    Drive, and returns the Drive root node
    """
    results = service.files().list(
        fields="nextPageToken, files(id,name,parents)",
        pageSize=1000
        ).execute()
        ### results is a dictionary

    next_page_token = results.get("nextPageToken")
    files = results.get("files",[])

    while next_page_token:
        results = service.files().list(
            fields="nextPageToken, files(id,name,parents)",
            pageToken=next_page_token,
            pageSize=1000
            ).execute()

        next_page_token = results.get("nextPageToken")
        files += results.get("files",[])
    
    # Build file tree
    file_id_to_object = {}
    child_to_parents_connections = []

    # Create drive file object
    drive_file_node = FileNode(None, "Google Drive")

    for file in files:
        file_node = FileNode(file["id"], file["name"])
        file_id_to_object[file_node.file_id] = file_node

        if "parents" in file:
            for parent_id in file["parents"]:
                # Add tuple of (child node, parent node) to connections
                # array until all child parent connections for this
                # child node have been added
                child_to_parents_connections.append(
                    (file_node.file_id, parent_id)
                    )


    for connection in child_to_parents_connections:
        parent_id = connection[1]
        child_id = connection[0]

        drive_error_check = False

        try:
            file_id_to_object[parent_id].add_child(child_id)
        except KeyError:
            if drive_error_check:
                raise Exception("Multiple drives detected")
            ## Exception if drive object has not yet been assigned its file id
            drive_error_check = True
            drive_file_node.file_id = parent_id
            file_id_to_object[parent_id] = drive_file_node
            file_id_to_object[parent_id].add_child(child_id)

    return drive_file_node


creds = authentication()
try:
    service = build_service(creds)
except HttpError as error:
    print(f"An error occurred: {error}")

build_file_directory(service)