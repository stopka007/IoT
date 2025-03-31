# Error Handling System

This directory contains utilities for standardized error handling across the application.

## ApiError Class

`ApiError` is a custom error class that extends the standard Error and adds:

- HTTP status code
- Error cause tracking
- JSON serialization

### Usage Examples

```typescript
// Create errors directly
throw new ApiError(404, "Resource not found");

// Use static helper methods
throw ApiError.notFound("User not found");
throw ApiError.badRequest("Invalid input data");
throw ApiError.unauthorized("Invalid credentials");
throw ApiError.forbidden("Access denied");
throw ApiError.conflict("Username already exists");
throw ApiError.internal("Database connection failed");

// Convert other errors to ApiError
try {
  // some operation
} catch (error) {
  throw ApiError.fromError(error);
}
```

## Error Utilities

The `errorUtils.ts` file provides helper functions for common error handling patterns:

### asyncHandler

Wraps route handlers to avoid repetitive try-catch blocks:

```typescript
// Instead of:
server.get("/", async (req, reply) => {
  try {
    // handler code
  } catch (error) {
    // error handling
  }
});

// Use:
server.get(
  "/",
  asyncHandler(async (req, reply) => {
    // handler code - errors are automatically caught
  }),
);
```

### checkResourceExists

Helper to verify a resource exists and throw a 404 if not:

```typescript
const user = await User.findById(id);
checkResourceExists(user, "User not found");
```

### handleMongooseError

Helper for handling Mongoose-specific errors:

```typescript
try {
  await document.save();
} catch (error) {
  handleMongooseError(error);
}
```

## Global Error Handler

The application includes a global error handler (in `middleware/errorHandler.ts`) that:

1. Logs all errors
2. Formats error responses consistently
3. Handles different error types appropriately
4. Provides detailed errors in development and sanitized errors in production

## Testing Error Handling

Visit `/api/examples/error-demo?error=TYPE` to test different error responses, where TYPE can be:

- not-found
- bad-request
- unauthorized
- forbidden
- conflict
- internal
