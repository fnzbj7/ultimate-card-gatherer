# Upload URLs - Menu Point Instructions

## Purpose

Upload URLs pointing to card images from external sources (Scryfall, official sites, etc.).

## Key Responsibilities

-   Parse and validate URLs for card images
-   Map URLs to specific cards in the set
-   Handle bulk URL uploads (paste list or file)
-   Validate URL accessibility

## Expected Input

-   List of image URLs (one per line or CSV)
-   URL format validation
-   Mapping to card numbers/names

## Common Patterns

-   Use textarea or file input for bulk URL entry
-   Validate URL format before saving
-   Show count of successfully parsed URLs
-   Handle duplicates and errors gracefully
-   Update hub page status flag: `isUrlUploadF`

## Related Files

-   `frontend/src/app/url-upload/`
-   Backend URL validation service
-   Image download preparation
