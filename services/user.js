import db from './db.js';

export async function db_registrarNuevoUsuario(userData) {
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

export async function db_autenticarUsuario(email){
    // Consultar el usuario por email
    const usuarios = await db.execute("SELECT email, hashed_password FROM usuarios WHERE email = ?", [email]);
    console.log("Usuarios:", usuarios.rows);

    return usuarios.rows.length > 0 ? usuarios.rows[0] : null;
}

export async function db_cambiarPasswordUsuario(email, newPassword){
    // Actualizar la contraseña del usuario
    const usuario = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (usuario.rows.length === 0) {
        throw new Error("Usuario no encontrado");
    }

    const result = await db.execute("UPDATE usuarios SET hashed_password = ? WHERE email = ?", [newPassword, email]);

    return result.rowsAffected > 0; // Devuelve true si se actualizó
}

// 1. Generar y guardar OTP
export async function db_crearCodigoOTP(usuarioId) {
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
export async function db_validarOTP(email, codigo) {
    const ahora = new Date().toISOString();

    const result = await db.execute({
        sql: `
        SELECT * FROM otp_codes
        WHERE email = ?
        AND codigo_otp = ?
        AND usado = 0
        AND fecha_expiracion > ?
        LIMIT 1
        `,
        args: [email, codigo, ahora]
    });

    return result.rows.length > 0;
}

// 3. Marcar OTP como usado
export async function db_marcarOTPUsado(usuarioId, codigo) {
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

export async function db_authGoogle(oauth) {
  const db = new Database('your_database.db');
  try {
    const stmtFind = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmtFind.get(oauth.email);

    if (user) {
      const stmtUpdate = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = ?');
      stmtUpdate.run(oauth.email);
      return { success: true, user, error: "" };
    } else {
      const userID = crypto.randomBytes(16).toString('hex');
      const provider = "https://accounts.google.com";

      const stmtInsert = db.prepare(`
        INSERT INTO users (
          id, email, name, given_name, lastname, oauth_provider, oauth_user_id,
          email_verified, profile_picture, created_date, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      stmtInsert.run(
        userID, oauth.email, oauth.name, oauth.given_name, oauth.family_name,
        provider, oauth.sub, oauth.email_verified ? 1 : 0, oauth.picture
      );

      const newUser = stmtFind.get(oauth.email);
      return { success: true, user: newUser, error: "" };
    }
  } catch (error) {
    console.error('Error en authGoogle:', error);
    return { success: false, user: {}, error };
  } finally {
    db.close();
  }
}

export async function db_authGithub(oauth) {
  const db = new Database('your_database.db');
  try {
    const stmtFind = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmtFind.get(oauth.email);

    if (user) {
      const stmtUpdate = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = ?');
      stmtUpdate.run(oauth.email);
      return { success: true, user, error: "" };
    } else {
      const userID = crypto.randomBytes(16).toString('hex');
      const provider = "https://api.github.com";

      const stmtInsert = db.prepare(`
        INSERT INTO users (
          id, email, name, oauth_provider, oauth_user_id,
          email_verified, profile_picture, created_date, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      stmtInsert.run(
        userID, oauth.email, oauth.name, provider, oauth.id,
        1, oauth.avatar_url
      );

      const newUser = stmtFind.get(oauth.email);
      return { success: true, user: newUser, error: "" };
    }
  } catch (error) {
    console.error('Error en authGithub:', error);
    return { success: false, user: {}, error };
  } finally {
    db.close();
  }
}
