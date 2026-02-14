// Placeholder User model for company-service
// Company service should call auth-service API for user operations
// This is a temporary stub to prevent import errors

export const User = {
    findById: async (id) => {
        console.warn('User.findById called in company-service - should use AuthServiceClient instead');
        return null;
    },
    findOne: async (query) => {
        console.warn('User.findOne called in company-service - should use AuthServiceClient instead');
        return null;
    },
    find: async (query) => {
        console.warn('User.find called in company-service - should use AuthServiceClient instead');
        return [];
    },
    create: async (data) => {
        console.warn('User.create called in company-service - should use AuthServiceClient instead');
        throw new Error('User creation should be done via auth-service API');
    }
};
