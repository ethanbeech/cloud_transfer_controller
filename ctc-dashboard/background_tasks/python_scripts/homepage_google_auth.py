from suites.google_drive_suite import google_authentication

if __name__ == "__main__":
    creds = google_authentication()
    # Must convert True to true and False to false for PythonShell
    print(str(creds.valid).lower())