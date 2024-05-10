# Cloud Transfer Controller

**This is very much a WIP**

## Overview
This is a desktop application written using the Nextron framework (Electron but using Next.js). Eventually, the aim is to access various cloud storage services alongside local storage devices and automate back-ups to ensure a suitable number copies of data in suitable places, and to automate the downloading/uploading of large numbers of files to avoid the issue of downloads failing a 95% completion and resetting all of the progress after having waited for hours.

## Tech Stack
- React/TypeScript UI
- TypeScript backend, utilising PythonShell 
- Python3 scripts for API calls and file modifications