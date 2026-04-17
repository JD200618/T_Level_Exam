# Security, accessibility, and legal notes

## Security
The prototype should:
- use server-side validation for important backend actions
- avoid storing sensitive information in public repositories
- keep environment-specific values in local environment files
- use session-aware authentication carefully
- protect state-changing requests with CSRF-aware handling where appropriate

## Accessibility
The prototype should aim to:
- support keyboard navigation
- use clear labels and readable forms
- provide sufficient colour contrast
- use understandable feedback and error states
- keep layouts readable on a range of screen sizes

## Legal and regulatory considerations
The prototype should consider:
- appropriate handling of personal data
- use of licensed or permitted assets only
- attribution where required
- fair and accurate product information
- accessibility expectations for public-facing digital services

## Current review notes
- Asset sources should continue to be recorded in `assets-log.md`
- Accessibility should be tested explicitly, not assumed
- Personal or client-sensitive data should not be committed to public repositories
