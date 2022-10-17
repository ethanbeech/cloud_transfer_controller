from oauthlib.oauth2 import WebApplicationClient

import json

with open("suites/credentials/dropbox_credentials.json","r") as f:
    data = json.load(f)
    app_key = data["app_key"]

client = WebApplicationClient(app_key)

authorization_url = "https://www.dropbox.com/oauth2/authorize"

url = client.prepare_request_uri(
    authorization_url,
    response_type="code"
)
print(url)