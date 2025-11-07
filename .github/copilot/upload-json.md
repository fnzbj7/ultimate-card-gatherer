# Upload JSON - Menu Point Instructions

## Purpose

Upload and validate JSON data containing card information for a specific Magic: The Gathering set.

## Key Responsibilities

-   Parse and validate JSON files containing card data
-   Map card information to database entities
-   Handle file upload with proper validation
-   Display upload status and errors

## Expected Data Structure

-   Card names, numbers, and set information
-   Card properties (colors, types, etc.)
-   Multilingual card names if applicable

## Common Patterns

-   Use Angular reactive forms for file upload
-   Validate JSON structure before processing
-   Show progress indicators during upload
-   Display validation errors clearly to user
-   Update hub page status flag: `isJsonUploadF`

## Related Files

-   `frontend/src/app/upload-json/`
-   Backend DTOs for card data validation
-   Database entities for card storage
