import { GithubUser } from "@schemas/github";
import { OAuthUserDBInput } from "@interfaces/oauth";

export function mapGithubToDB(user: GithubUser): OAuthUserDBInput {
    return {
        email: user.email ?? `${user.login}@github.local`, // fallback si no hay email público
        name: user.name ?? user.login,
        lastname: "", // GitHub no expone apellido
        provider: "https://github.com",
        providerUserId: user.id.toString(),
        emailVerified: true, // GitHub no expone email_verified directamente
        picture: user.avatar_url,
        countryId: 1, // Default: México
    };
}