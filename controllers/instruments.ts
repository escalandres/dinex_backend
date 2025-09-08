import { db_getInstrumentCatalogs, db_registerInstrument, db_updateInstrument, db_getUserInstruments } from "../services/instruments.js";

export const getUserInstruments = async (req, res) => {
    try {
        const instruments = await db_getUserInstruments(req.params.idUsuario);
        const catalogs = await db_getInstrumentCatalogs();
        res.status(200).json({ instruments, catalogs });
    } catch (error) {
        console.error("Error al obtener instrumentos:", error);
        res.status(500).json({ error: "Error al obtener instrumentos" });
    }
};

export const registerInstrument = async (req, res) => {
    try {
        await db_registerInstrument(req.body);
        res.status(201).json({ message: "Instrumento registrado exitosamente" });
    } catch (error) {
        console.error("Error al registrar instrumento:", error);
        res.status(500).json({ error: "Error al registrar instrumento" });
    }
};

export const updateInstrument = async (req, res) => {
    try {
        await db_updateInstrument(req.body);
        res.status(200).json({ message: "Instrumento actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar instrumento:", error);
        res.status(500).json({ error: "Error al actualizar instrumento" });
    }
};
