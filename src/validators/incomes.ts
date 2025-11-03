import { application } from 'express';
import { z } from 'zod';
// Validator for registration
export const incomeValidator = z.object({
    id: z.number()
        .int("Instrument ID must be an integer")
        .positive("Instrument ID must be a positive number")
        .optional(),

    source: z.number()
        .min(1, "Source is required")
        .int("Source must be an integer")
        .positive("Source must be a positive number"),

    description: z.string()
        .min(1, "Description is required")
        .max(250, "Description must be less than 250 characters"),

    amount: z.number()
        .min(1, "Amount is required")
        .positive("Amount must be a positive number"),

    currency: z.string()
        .min(1, "Currency is required")
        .max(3, "Currency must be less than or equal to 3 characters")
        .transform(val => val.toLocaleUpperCase().trim()),

    frequency: z.number()
        .min(1, "Frequency is required")
        .int("Frequency must be an integer")
        .positive("Frequency must be a positive number"),

    application_date: z.string()
        .refine((dateStr) => !isNaN(Date.parse(dateStr)), {
            message: "Application date must be a valid date string",
        })
});

export const incomeDeleteValidator = z.object({
    id: z.number()
        .int("Income ID must be an integer")
        .positive("Income ID must be a positive number"),
});

export const headerValidator = z.object({
    authorization: z.string().startsWith('Bearer '),
    'x-csrf-token': z.string().min(10)
});

// Group all Validators
export const incomesValidators = {
    incomes: incomeValidator,
    delete: incomeDeleteValidator,
    headers: headerValidator
};