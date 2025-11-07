# Upload to AWS - Menu Point Instructions

## Purpose

Upload processed card images to AWS S3 for public access and CDN distribution.

## Key Responsibilities

-   Upload images from `/finished/` folder to AWS S3
-   Organize images by set code in S3 buckets
-   Track upload progress and status
-   Handle upload failures and retries
-   Set proper S3 permissions for public access

## Dependencies

-   Requires `isCheckNumberF` to be true
-   Images must be converted and ready

## Common Patterns

-   Show upload progress with current/total files
-   Display upload status for each file
-   Handle AWS authentication and permissions
-   Update hub page status flag: `isUploadAwsF`
-   Support batch uploads with error handling

## AWS S3 Structure

-   Bucket organization by set code
-   Proper file naming conventions
-   CDN cache invalidation if needed

## Related Files

-   `frontend/src/app/aws-upload/`
-   Backend AWS S3 service
-   AWS credentials configuration
