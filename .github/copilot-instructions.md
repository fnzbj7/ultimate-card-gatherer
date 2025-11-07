# GitHub Copilot Instructions for Ultimate Card Gatherer

## Project Overview

This is a full-stack application for managing Magic: The Gathering card collections with image processing capabilities.

**Stack:**

-   Frontend: Angular with Tailwind CSS
-   Backend: NestJS
-   Database: SQLite

## General Coding Standards

### TypeScript

-   Use strict TypeScript typing
-   Avoid `any` types - use proper interfaces or type definitions
-   Use meaningful variable and function names
-   Prefer `const` over `let` when values don't change

### Code Style

-   Use 2 spaces for indentation
-   Use single quotes for strings
-   Include proper error handling for async operations
-   Add comments for complex business logic

## Frontend (Angular)

### Component Structure

-   Follow Angular style guide conventions
-   Use kebab-case for component selectors and filenames
-   Organize files: `component-name.component.ts|html|scss|spec.ts`
-   Keep templates clean - move complex logic to the component class

### Angular Patterns

-   Use reactive forms (`FormGroup`, `FormControl`) for form handling
-   Utilize RxJS operators for stream transformations
-   Use `async` pipe in templates to auto-unsubscribe
-   Implement OnDestroy and unsubscribe from manual subscriptions
-   Use Angular services for data management and API calls

### Styling

-   Use Tailwind CSS utility classes
-   Follow existing class patterns (e.g., `btn-primary`, `btn-secondary`)
-   Maintain responsive design with Tailwind breakpoints

## Backend (NestJS)

### API Design

-   Use RESTful conventions
-   Implement proper DTOs for request/response validation
-   Use dependency injection for services
-   Keep controllers thin - business logic belongs in services

### File Organization

-   Controllers handle HTTP requests
-   Services contain business logic
-   Entities define database models
-   DTOs in separate folder for validation
-   Repository pattern for data access

## Project-Specific Context

### Domain Knowledge

-   Working with Magic: The Gathering card sets
-   Set codes (e.g., BIG, BLB, DSK, FDN) represent different card sets
-   Image processing workflow: raw → png → finished
-   Cards can have front/back faces (double-faced cards)

### Common Workflows

-   Image processing and OCR for card recognition
-   Card number mapping and validation
-   Set management and card collection tracking
