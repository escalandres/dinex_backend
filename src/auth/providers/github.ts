import { consoleLog } from "@src/utils/helpers";
export async function getGithubToken(code: string): Promise<string | undefined> {
    try {
        const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code
        });

        const response = await fetch(`https://github.com/login/oauth/access_token?${params.toString()}`, {
        method: "POST",
        headers: { Accept: "application/json" }
        });

        const data = await response.json();
        consoleLog("🔑 Token GitHub:", data.access_token);
        return data.access_token;
    } catch (error) {
        console.error("❌ Error al obtener token de GitHub:", error);
        return undefined;
    }
}

export async function getGithubUser(token: string): Promise<unknown> {
    try {
        const response = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        consoleLog("👤 Usuario GitHub:", data);
        return data;
    } catch (error) {
        console.error("❌ Error al obtener usuario de GitHub:", error);
        return {};
    }
}