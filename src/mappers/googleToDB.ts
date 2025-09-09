import { GoogleUserSchema, GoogleUser } from "@schemas/google";
import { OAuthUserDBInput } from "@interfaces/oauth";

export function mapGoogleToDB(user: GoogleUser): OAuthUserDBInput {
    return {
            email: user.email,
            name: user.name,
            provider: "https://accounts.google.com",
            providerUserId: user.sub,
            emailVerified: user.email_verified ?? true,
            picture: user.picture,
            countryId: 1 // Default: México
    };
}