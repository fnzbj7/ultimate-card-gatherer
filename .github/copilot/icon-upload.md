# Upload Set Icon - Menu Point Instructions

## Purpose

Upload the set icon/symbol for a Magic: The Gathering set.

## Key Responsibilities

-   Handle image file upload (PNG/SVG format preferred)
-   Validate image dimensions and file size
-   Preview uploaded icon
-   Store icon for set identification

## Common Patterns

-   Use file input with image preview
-   Validate file type and size before upload
-   Show visual feedback on successful upload
-   Update hub page status flag: `isIconUploadF`

## Related Files

-   `frontend/src/app/icon-upload/`
-   Backend image storage service
-   Set icon display in UI components
