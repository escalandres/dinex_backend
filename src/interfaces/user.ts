export interface User {
    uuid: string;
    email: string;
    name: string;
    lastname: string;
    hashedPassword: string;
    profile_picture?: string;
    country: object;
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
    };
}