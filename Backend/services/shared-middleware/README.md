# Shared Authentication Middleware

This package provides shared authentication middleware for ShiftMate microservices.

## Usage

### Basic Usage (Token Verification Only)

For services that don't need full user data:

```javascript
import createAuthMiddleware from '@shiftmate/shared-middleware';

const isAuthenticated = createAuthMiddleware();

app.use('/api/protected', isAuthenticated, protectedRoute);
```

### Advanced Usage (With User Model)

For services that have access to the User model:

```javascript
import createAuthMiddleware from '@shiftmate/shared-middleware';
import { User } from './Models/user.model.js';

const isAuthenticated = createAuthMiddleware({
    getUserById: async (userId) => {
        return await User.findById(userId).select('-password');
    }
});

app.use('/api/protected', isAuthenticated, protectedRoute);
```

## Environment Variables

- `SECRET_KEY`: JWT secret key (required)

## Request Object

After authentication, `req.user` will contain:

- `userId`: User ID from token
- `role`: User role
- `recruiterType`: Recruiter type (if applicable)
- `companyId`: Company ID (if applicable)
- Full user object (if `getUserById` is provided)
