// import * as sanitizeHtml from "sanitize-html";

import { LoginData, SignupData } from "@src/validators/types";

// Protección contra prototype pollution - verificar keys peligrosos
const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

function sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    // Basic sanitization
    return input
        // Eliminate HTML tags (XSS basic)
        .replace(/<[^>]*>/g, '')
        // Eliminate javascript: y data: URLs (XSS)
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        // Eliminate event handlers (XSS)
        .replace(/on\w+\s*=/gi, '')
        // Eliminate dangerous HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        // Protection against prototype pollution
        .replace(/__proto__/gi, '')
        .replace(/constructor/gi, '')
        .replace(/prototype/gi, '')
        // Clean white spaces
        .trim()
        .replace(/\s+/g, ' ');
}

export function sanitizeLoginData(data: LoginData): LoginData {
    // Check if any key is dangerous
    for (const key of Object.keys(data)) {
        if (dangerousKeys.some(dangerous => key.toLowerCase().includes(dangerous))) {
        throw new Error('Invalid property name detected');
        }
    }
    
    return {
        email: sanitizeString(data.email),
        password: data.password // Keep password intact
    };
}

export function sanitizeSignupData(data: SignupData): SignupData {
    // Check if any key is dangerous
    for (const key of Object.keys(data)) {
        if (dangerousKeys.some(dangerous => key.toLowerCase().includes(dangerous))) {
        throw new Error('Invalid property name detected');
        }
    }
    
    return {
        email: sanitizeString(data.email),
        name: sanitizeString(data.name),
        lastname: sanitizeString(data.lastname),
        confirmPassword: data.confirmPassword, // Keep confirmPassword intact
        password: data.password, // Keep password intact
        countryId: data.countryId // Keep countryId intact
    };
}