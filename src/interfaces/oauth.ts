export interface OAuthUserDBInput {
    email: string;
    name: string;
    lastname?: string;
    provider: 'https://accounts.google.com' | 'https://github.com';
    providerUserId: string;
    emailVerified: boolean;
    picture?: string;
    createdDate?: number;
    countryId?: number;
}