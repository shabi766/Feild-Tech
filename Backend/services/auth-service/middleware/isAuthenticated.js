import { User } from "../Models/user.model.js";
import createAuthMiddleware from "../../shared-middleware/index.js";

// Use the shared auth middleware so behaviour is consistent across services.
// This middleware:
// - Accepts JWT tokens from httpOnly cookies OR Authorization: Bearer headers
// - Verifies the token using SECRET_KEY
// - Optionally loads the full User document and attaches it to req.user
const isAuthenticated = createAuthMiddleware({
    getUserById: async (userId) => {
        return await User.findById(userId).select("-password");
    },
});

export default isAuthenticated;
