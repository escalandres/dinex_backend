import { z } from 'zod';
// Validator for registration
export const instrumentValidator = z.object({
    id: z.number()
        .int("Instrument ID must be an integer")
        .positive("Instrument ID must be a positive number")
        .optional(),

    description: z.string()
        .min(1, "Description is required")
        .max(250, "Description must be less than 250 characters"),

    type: z.number()
        .min(1, "Type is required")
        .int("Type must be an integer")
        .positive("Type must be a positive number"),

    subtype: z.number()
        .min(1, "Subtype is required")
        .int("Subtype must be an integer")
        .positive("Subtype must be a positive number"),
    
    cut_off_day: z.number()
        .int("Cut off day must be an integer")
        .min(1, "Cut off day must be at least 1")
        .max(31, "Cut off day must be less than or equal to 31"),

    payment_due_day: z.number()
        .int("Payment due day must be an integer")
        .min(1, "Payment due day must be at least 1")
        .max(31, "Payment due day must be less than or equal to 31"),

    currency: z.string()
        .min(1, "Currency is required")
        .max(3, "Currency must be less than or equal to 3 characters")
        .transform(val => val.toLocaleUpperCase().trim()),
});

export const instrumentDeleteValidator = z.object({
    id: z.number()
        .int("Instrument ID must be an integer")
        .positive("Instrument ID must be a positive number"),
});

export const headerValidator = z.object({
    authorization: z.string().startsWith('Bearer '),
    'x-csrf-token': z.string().min(10)
});

// Group all Validators
export const instrumentsValidators = {
    instruments: instrumentValidator,
    delete: instrumentDeleteValidator,
    headers: headerValidator
};