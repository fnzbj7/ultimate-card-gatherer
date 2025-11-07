# Hub Page - Central Navigation Instructions

## Purpose

Central hub for managing card set processing workflow with status tracking.

## Key Responsibilities

-   Display all available menu points organized in groups
-   Show completion status for each workflow step
-   Enable/disable menu items based on dependencies
-   Navigate to specific workflow pages
-   Track overall set processing progress

## Menu Groups

### Group 1: Setup & Configuration

1. **Upload JSON** - Upload card data
2. **Upload Set Icon** - Upload set symbol
3. **Generate Migration** - Create database scripts (requires JSON upload)

### Group 2: Image Collection

1. **Upload URLs** - Provide image URLs
2. **Download Images** - Download from URLs (requires URL upload)

### Group 3: Processing & Publishing

1. **Check Numbers** - Verify card numbers (requires URLs + JSON)
2. **Convert Images** - Optimize images (requires number verification)
3. **Upload to AWS** - Publish to cloud (requires number verification)

## Status Flags

-   `isJsonUploadF` - JSON data uploaded
-   `isIconUploadF` - Set icon uploaded
-   `isMigrationGeneratedF` - Migration generated
-   `isUrlUploadF` - URLs uploaded
-   `isDownloadImagesF` - Images downloaded
-   `isCheckNumberF` - Card numbers verified
-   `isConvertToWebpF` - Images converted
-   `isUploadAwsF` - Images uploaded to AWS

## Common Patterns

-   Disable dependent menu items until prerequisites complete
-   Visual indicators for completed steps
-   Breadcrumb navigation showing current set
-   Menu button component with status display

## Related Files

-   `frontend/src/app/hub/`
-   Breadcrumb component
-   Menu button component (`app-menu-btn`)
