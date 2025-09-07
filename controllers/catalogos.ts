import { db_consultarCatalogoPaises } from '../services/catalogos.js';

export async function consultarCatalogoPaises(req, res) {
    try {
        const catalogo = await db_consultarCatalogoPaises();
        res.status(200).json(catalogo);
    } catch (error) {
        console.error("Error al consultar el catálogo de países:", error);
        res.status(500).json({ error: "Error al consultar el catálogo de países" });
    }
}