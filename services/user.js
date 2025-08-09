import db from '../db.js';

export async function registrarNuevoUsuario(userData) {
    await db.execute({
        sql: `
        INSERT INTO usuarios (email, nombre, apellido, oauth_provider, oauth_user_id, email_verified, profile_picture, created_date, last_login, hashed_password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            userData.email,                  // email
            userData.nombre,                 // nombre
            userData.apellido,               // apellido
            userData.oauth_provider,         // oauth_provider
            userData.oauth_user_id,          // oauth_user_id
            false,                           // email_verified
            userData.profile_picture || "",  // profile_picture
            Date.now(),                      // created_date
            Date.now(),                      // last_login
            userData.hashed_password || ""   // hashed_password
        ]
    });

}

export async function autenticarUsuario(email){
    // Consultar el usuario por email
    const usuarios = await db.execute("SELECT email, hashed_password FROM usuarios WHERE email = ?", [email]);
    console.log("Usuarios:", usuarios.rows);

    return usuarios.rows.length > 0 ? usuarios.rows[0] : null;
}

export async function cambiarPasswordUsuario(email, newPassword){
    // Actualizar la contraseña del usuario
    const usuario = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (usuario.rows.length === 0) {
        throw new Error("Usuario no encontrado");
    }

    const result = await db.execute("UPDATE usuarios SET hashed_password = ? WHERE email = ?", [newPassword, email]);

    return result.rowsAffected > 0; // Devuelve true si se actualizó
}

// 1. Generar y guardar OTP
export async function crearCodigoOTP(usuarioId) {
    const codigo = generarOTP();
    const ahora = new Date();
    const expiracion = new Date(ahora.getTime() + 5 * 60 * 1000); // 5 min

    await db.execute({
        sql: `
        INSERT INTO otp_codes (usuario_id, codigo_otp, fecha_expiracion)
        VALUES (?, ?, ?)
        `,
        args: [usuarioId, codigo, expiracion.toISOString()]
    });

    return codigo;
}

// 2. Validar OTP
export async function validarOTP(usuarioId, codigo) {
    const ahora = new Date().toISOString();

    const result = await db.execute({
        sql: `
        SELECT * FROM otp_codes
        WHERE usuario_id = ?
        AND codigo_otp = ?
        AND usado = 0
        AND fecha_expiracion > ?
        LIMIT 1
        `,
        args: [usuarioId, codigo, ahora]
    });

    return result.rows.length > 0;
}

// 3. Marcar OTP como usado
export async function marcarOTPUsado(usuarioId, codigo) {
    await db.execute({
        sql: `
        UPDATE otp_cambio_password
        SET usado = 1
        WHERE usuario_id = ?
        AND codigo_otp = ?
        `,
        args: [usuarioId, codigo]
    });
}

function generarOTP() {
    const numero = Math.floor(Math.random() * 1000000); // 0 a 999999
    return numero.toString().padStart(6, '0');
}

