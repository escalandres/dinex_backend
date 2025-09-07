import { createClient, Client } from '@libsql/client';

// process.loadEnvFile();

const db: Client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!
});

// Función para probar la conexión
export async function testConnection(): Promise<boolean> {
    try {
        const result = await db.execute("SELECT 1 as test");
        console.log("✅ Conexión a Turso exitosa");
        return true;
    } catch (error) {
        console.error("❌ Error conectando a Turso:", error);
        return false;
    }
}

// Función helper para queries más limpias
export async function query(sql: string, params?: any[]) {
    try {
        const result = await db.execute({
            sql,
            args: params || []
        });
        return result;
    } catch (error) {
        console.error("Error en query:", error);
        throw error;
    }
}

// Exportar el cliente por defecto (para mantener compatibilidad)
export default db;