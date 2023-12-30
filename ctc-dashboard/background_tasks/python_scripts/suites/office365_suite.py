import azure.identity
import configparser
import sys
import json

import os.path

from msgraph.core import GraphClient
from azure.identity import DeviceCodeCredential

# Define functions
def initialise_graph_for_user_auth(config):
    this.config = config
    client_id = this.config["clientId"]
    tenant_id = this.config["authTenant"]
    graph_scopes = this.settings["graphUserScopes"].split(" ")

    this.device_code_credential = DeviceCodeCredential(client_id, tenant_id=tenant_id)
    this.user_client = GraphClient(credential=this.device_code_credential, scopes=graph_scopes)

# Assign variables to the module so they stay set - I think this means assing them to 'office365_suite.py' whilst it's being used
# Assuming that is true, this should be usable between the different functions to assing and carry variables
this = sys.modules[__name__]

# Load settings

# if os.path.exists("suites/credentials/azure_credentials.json"):
#     print("PATH EXISTS")
#     creds = json.load("suites/credentials/azure_credentials.json")
# else:
#     print("NADA")

with open("suites/credentials/azure_credentials.json") as json_file:
    credentials = json.load(json_file)
    print(credentials)

# azureSettings = config["azure"]

# Initialise graph
# initialise_graph_for_user_auth(azureSettings)


