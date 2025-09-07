import { db_consultarInstrumentosUsuario, db_consultarCatalogosInstrumentos } from "../services/instrumentos.js";

export const obtenerInstrumentos = async (req, res) => {
    try {
        const instrumentos = await db_consultarInstrumentosUsuario(req.params.idUsuario);
        const catalogos = await db_consultarCatalogosInstrumentos();
        res.status(200).json({ instrumentos, catalogos });
    } catch (error) {
        console.error("Error al obtener instrumentos:", error);
        res.status(500).json({ error: "Error al obtener instrumentos" });
    }
};
