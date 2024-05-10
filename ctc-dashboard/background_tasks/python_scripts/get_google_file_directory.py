from suites.google_drive_suite import google_authentication, build_google_service, build_file_directory
from sys import exit

if __name__ == "__main__":
    creds = google_authentication()
    # TODO: Add fail case
    # if not creds or not creds.valid:
    #     print("false")
    #     exit()
    service = build_google_service(creds)
    drive_file_node = build_file_directory(service)
    print("true")
    print(drive_file_node.jsonify())