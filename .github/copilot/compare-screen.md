# Check Numbers (Compare Screen) - Menu Point Instructions

## Purpose

Match downloaded card images with their correct card numbers using OCR and manual verification.

## Key Responsibilities

-   Display card images from `/raw/` folder
-   Run OCR to extract text from images
-   Suggest possible card numbers based on recognized text
-   Allow manual card number assignment via radio buttons
-   Handle double-faced cards (front/back images)
-   Save card number mappings

## Dependencies

-   Requires `isUrlUploadF` and `isJsonUploadF` to be true
-   Images must be downloaded and JSON data uploaded

## UI Components

-   Image preview with zoom on hover (bottom-left corner detail view)
-   Radio button selection for card number options
-   "Nope" option for invalid cards
-   Form submission with Save/Back buttons
-   Visual indicators for rename state (init/load/finished)

## Common Patterns

-   Use reactive forms with dynamic FormControls for each image
-   Display possible card numbers as radio options
-   Show both front and back images for double-faced cards
-   Image URLs: `http://localhost:5004/{SET_CODE}/raw/{IMAGE_NAME}`
-   Update hub page status flag: `isCheckNumberF`

## Card Number Mapping

-   Match image filename to card number
-   Handle variations in OCR results
-   Support manual override for difficult cases

## Related Files

-   `frontend/src/app/compare-screen/`
-   Backend OCR service (uses Tesseract with `eng.traineddata`)
-   Card mapping DTOs
