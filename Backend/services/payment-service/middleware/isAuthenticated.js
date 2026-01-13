import createAuthMiddleware from "../../shared-middleware/index.js";

// Create authentication middleware without User model access
// Payment Service doesn't need full user data, just token verification
const isAuthenticated = createAuthMiddleware();

export default isAuthenticated;
