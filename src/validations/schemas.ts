import { uuid, z } from 'zod';

// Schema for registration
export const signupSchema = z.object({
    email: z.string()
        .email("Email must be a valid email address")
        .min(1, "Email is required")
        .transform(val => val.toLowerCase().trim()),
    
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must be less than 128 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    
    name: z.string()
        .min(1, "Name is required")
        .max(50, "Name must be less than 50 characters")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Name can only contain letters and spaces")
        .transform(val => val.trim()),
    
    lastname: z.string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Last name can only contain letters and spaces")
        .transform(val => val.trim()),
    
    countryId: z.number()
        .int("Country ID must be an integer")
        .positive("Country ID must be a positive number")
});

// Schema for login
export const loginSchema = z.object({
    email: z.string()
        .email("Email must be a valid email address")
        .transform(val => val.toLowerCase().trim()),
    password: z.string()
        .min(1, "Password is required")
});

// Schema for updating profile
export const updateProfileSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(50, "Name must be less than 50 characters")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Name can only contain letters and spaces")
        .transform(val => val.trim())
        .optional(),
    
    lastname: z.string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Last name can only contain letters and spaces")
        .transform(val => val.trim())
        .optional(),
    
    countryId: z.number()
        .int("Country ID must be an integer")
        .positive("Country ID must be a positive number")
        .optional()
    }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
});

// Schema for changing password
export const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        
        newPassword: z.string()
            .min(8, "New password must be at least 8 characters long")
            .max(128, "New password must be less than 128 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
            "New password must contain at least one uppercase letter, one lowercase letter, and one number"),
    
        confirmPassword: z.string(),

        uuid: z.string().uuid("Invalid user ID")
    }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

export const oauthSchema = z.object({
    email: z.string()
        .email("Email must be a valid email address")
        .min(1, "Email is required")
        .transform(val => val.toLowerCase().trim()),
    name: z.string()
        .min(1, "Name is required")
        .max(50, "Name must be less than 50 characters")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Name can only contain letters and spaces")
        .transform(val => val.trim()),
    lastname: z.string()
        .max(50, "Last name must be less than 50 characters")
        .regex(/^[a-zA-ZÀ-ÿ\s]*$/, "Last name can only contain letters and spaces")
        .transform(val => val.trim())
        .optional(),
    provider: z.string()
        .min(1, "Provider is required"),
    providerUserId: z.string()
        .min(1, "Provider user ID is required"),
    emailVerified: z.boolean(),
    picture: z.string()
        .url("Picture must be a valid URL")
        .optional(),
    countryId: z.number()
        .int("Country ID must be an integer")
        .positive("Country ID must be a positive number")
        .optional()
});

export const fileSchema = z.object({
    originalname: z.string().min(1, "File name is required"),
    mimetype: z.string().regex(/^image\/(jpeg|png|gif)$/, "Only JPEG, PNG, and GIF images are allowed"),
    size: z.number().max(3 * 1024 * 1024, "File size must be less than 3MB"), // 3MB
    uuid: z.string().uuid()
});

// Group all schemas
export const schemas = {
    signup: signupSchema,
    login: loginSchema,
    updateProfile: updateProfileSchema,
    changePassword: changePasswordSchema,
    oauth: oauthSchema,
    file: fileSchema
};