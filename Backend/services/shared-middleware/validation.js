import { z } from 'zod';

/**
 * Common validation schemas using Zod
 * Provides reusable validation for common fields across microservices
 */

// Common field validations
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID');

// User validation schemas
export const registerSchema = z.object({
    fullname: z.string().min(2, 'Full name must be at least 2 characters'),
    email: emailSchema,
    phoneNumber: z.string().regex(
        /^(\+92|0)?3[0-9]{9}$/,
        'Invalid phone number'
    ).optional(),
    password: passwordSchema,
    cnic: z.string().regex(
        /^\d{5}-\d{7}-\d{1}$/,
        'Invalid CNIC format'
    ).optional(),
    role: z.enum(['Technician', 'Recruiter', 'Company']),
    recruiterType: z.enum(['Individual', 'Company']).optional(),
    companyId: z.string().optional(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
    fullname: z.string().min(2).optional(),
    phoneNumber: phoneSchema.optional(),
    bio: z.string().max(500).optional(),
    skills: z.array(z.string()).optional(),
});

// Job/Workorder validation schemas
export const createJobSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    skills: z.string().or(z.array(z.string())),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    jobType: z.enum(['full-time', 'part-time']),
    startTime: z.string().datetime().or(z.date()),
    endTime: z.string().datetime().or(z.date()),
    rate: z.number().positive().or(z.string()),
    rateType: z.string(),
    status: z.enum(['Draft', 'Active', 'Assigned', 'In Progress', 'Done', 'Review', 'Complete', 'Cancel', 'Paid']).optional(),
});

// Company validation schemas
export const createCompanySchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    email: emailSchema,
    phoneNumber: phoneSchema,
    industry: z.string().optional(),
    website: z.string().url().optional(),
});

// Client validation schemas
export const createClientSchema = z.object({
    name: z.string().min(2, 'Client name must be at least 2 characters'),
    email: emailSchema.optional(),
    phoneNumber: phoneSchema.optional(),
    address: z.string().optional(),
});

/**
 * Validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = req[source];
            const validated = schema.parse(data);
            req[source] = validated; // Replace with validated data
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: (error.errors || []).map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};

export default {
    emailSchema,
    passwordSchema,
    phoneSchema,
    mongoIdSchema,
    registerSchema,
    loginSchema,
    updateUserSchema,
    createJobSchema,
    createCompanySchema,
    createClientSchema,
    validate,
};
