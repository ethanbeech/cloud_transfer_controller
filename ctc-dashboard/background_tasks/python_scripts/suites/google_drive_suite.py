
from msilib.schema import Error
import os
import os.path
import sys

from pathlib import Path

import google.auth.transport.requests
import requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

## File downloads
import io
from googleapiclient.http import MediaIoBaseDownload

from suites.tree_classes import *


SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

def google_authentication():
    creds = None
    os.chdir(os.path.dirname(sys.argv[0]))
    token_directory = "credentials/google_token.json"
    credentials_directory = "credentials/google_credentials.json"

    if os.path.exists(token_directory):
        creds = Credentials.from_authorized_user_file(token_directory, SCOPES)
    # Login if no valid credentials
    if not creds or not creds.valid:
        # Add here is token can be refreshed

        # Else generate new token from login details
        flow = InstalledAppFlow.from_client_secrets_file(
            credentials_directory, SCOPES
        )
        creds = flow.run_local_server(port=0)
        # Save credentials for the next run
        with open(token_directory,"w") as token:
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
        fields="nextPageToken, files(id,name,parents,mimeType,fileExtension)",
        pageSize=1000
        ).execute()
        ### results is a dictionary

    next_page_token = results.get("nextPageToken")
    files = results.get("files",[])

    while next_page_token:
        results = service.files().list(
            fields="nextPageToken, files(id,name,parents,mimeType,fileExtension)",
            pageToken=next_page_token,
            pageSize=1000
            ).execute()

        next_page_token = results.get("nextPageToken")
        files += results.get("files",[])
    
    # Build file tree
    file_id_to_object = {}
    child_to_parents_connections = []

    # Create drive file object
    drive_file_node = FileNode(None, "Google Drive", ".dir")

    for file in files:
        # If file has a file extension
        # TODO: sort out the files which don't have a file extension
        if "fileExtension" in file:
            file_node = FileNode(file["id"], file["name"], file["fileExtension"])
        else:
            file_node = FileNode(file["id"], file["name"], None)
        
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
            # Add child object to parent object.children
            file_id_to_object[parent_id].add_child(file_id_to_object[child_id])
        except KeyError:
            if drive_error_check:
                raise Exception("Multiple drives detected")
            ## Exception if drive object has not yet been assigned its file id
            drive_error_check = True
            drive_file_node.file_id = parent_id
            file_id_to_object[parent_id] = drive_file_node
            # Add child object to drive node object.children
            file_id_to_object[parent_id].add_child(file_id_to_object[child_id])

    return drive_file_node

def download_file(service, file_node):
    # Get the file from the file ID
    request = service.files().get_media(fileId=file_node.file_id)
    file = io.BytesIO()

    # Download file
    downloader = MediaIoBaseDownload(file,request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
        print(f"Detect {int(status.progress()*100)}.")

    # Save file
    with open("{}.{}".format(file_node.file_title,file_node.file_ext), "wb") as f:
        f.write(file.getvalue())