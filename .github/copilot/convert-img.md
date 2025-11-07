# Convert Images - Menu Point Instructions

## Purpose

Convert card images from raw format to optimized WebP format for web usage.

## Key Responsibilities

-   Convert images from `/raw/` folder
-   Process to PNG in `/png/` folder (intermediate step)
-   Final conversion to WebP in `/finished/` folder
-   Compress images for optimal web performance
-   Maintain image quality during conversion

## Dependencies

-   Requires `isCheckNumberF` to be true
-   Card numbers must be verified first

## Image Processing Pipeline

1. Source: `/raw/` folder (original downloads)
2. Intermediate: `/png/` folder (PNG conversion)
3. Final: `/finished/` folder (WebP optimized)

## Common Patterns

-   Show conversion progress with count/total
-   Display file size before/after conversion
-   Handle batch processing efficiently
-   Update hub page status flag: `isConvertToWebpF`
-   Log conversion results to `backend/log/compress-images/`

## Performance Considerations

-   Process images in batches to avoid memory issues
-   Show real-time progress updates
-   Handle errors for corrupted images

## Related Files

-   `frontend/src/app/convert-img/`
-   Backend image conversion service
-   Compression logs in `backend/log/compress-images/`
