# Download Images - Menu Point Instructions

## Purpose

Download card images from uploaded URLs to local storage for processing.

## Key Responsibilities

-   Download images from URLs in batches
-   Save to `backend/img-new/{SET_CODE}/raw/` directory
-   Track download progress
-   Handle failed downloads and retries
-   Validate downloaded image files

## Dependencies

-   Requires `isUrlUploadF` to be true
-   URLs must be uploaded first

## Common Patterns

-   Show progress bar with current/total downloads
-   Display download status for each image
-   Handle network errors with retry logic
-   Update hub page status flag: `isDownloadImagesF`
-   Use Server-Sent Events (SSE) for real-time progress updates

## Image Processing Workflow

-   Images saved to `/raw/` folder first
-   Later converted to PNG in `/png/` folder
-   Final processed images in `/finished/` folder

## Related Files

-   `frontend/src/app/image-download/`
-   Backend download service
-   SSE for progress tracking
