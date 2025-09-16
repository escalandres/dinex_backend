export interface User {
    uuid: string;
    email: string;
    name: string;
    lastname: string;
    hashedPassword: string;
    profile_picture?: string;
    country: object;
    email_verified: boolean;
}

export interface Authenticate {
    email: string;
    hashedPassword: string;
    uuid: string;
}

export interface Register {
    uuid: string;
    country?: object;
}

export interface JWTPayload {
    user: {
        uuid: string;
        email: string;
        name: string;
        lastname: string;
        profile_picture?: string;
        country: object;
        email_verified: boolean;
    };
    purpose: string;
    issuedAt: number; // timestamp of token issuance
}

export interface JWTPayloadVerify {
    uuid: string;
    purpose: string;
    issuedAt: number; // timestamp of token issuance
    exp?: number; // expiration time as a timestamp
}