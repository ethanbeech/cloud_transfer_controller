import azure.identity
import configparser
import sys

from msgraph.core import GraphClient
from azure.identity import DeviceCodeCredential

# Assign variables to the module so they stay set - I think this means assing them to 'office365_suite.py' whilst it's being used
# Assuming that is true, this should be usable between the different functions to assing and carry variables
this = sys.modules[__name__]

# Load settings
config = configparser.ConfigParser()
config.read(["azure_config.cfg", "azure_config.dev.cfg"])
print(config)
# azureSettings = config["azure"]

# Initialise graph
initialise_graph_for_user_auth(azureSettings)


def initialise_graph_for_user_auth(config):
    this.config = config
    client_id = this.config["clientId"]
    tenant_id = this.config["authTenant"]
    graph_scopes = this.settings["graphUserScopes"].split(" ")

    this.device_code_credential = DeviceCodeCredential(client_id, tenant_id=tenant_id)
    this.user_client = GraphClient(credential=this.device_code_credential, scopes=graph_scopes)