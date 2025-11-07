# Generate Migration - Menu Point Instructions

## Purpose

Generate database migration scripts based on uploaded JSON card data.

## Key Responsibilities

-   Create migration files for new card sets
-   Map JSON card data to database schema
-   Generate SQL scripts for card insertion
-   Validate data integrity before migration

## Dependencies

-   Requires `isJsonUploadF` to be true
-   JSON data must be uploaded first

## Common Patterns

-   Read uploaded JSON data
-   Transform data to match database schema
-   Generate SQL INSERT/UPDATE statements
-   Provide migration script download
-   Update hub page status flag: `isMigrationGeneratedF`

## Related Files

-   `frontend/src/app/generate-migration/`
-   Backend migration generation service
-   Database entities and schema
