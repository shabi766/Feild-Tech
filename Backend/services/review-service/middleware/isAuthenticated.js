import createAuthMiddleware from "../../shared-middleware/index.js";

const isAuthenticated = createAuthMiddleware();

export default isAuthenticated;
