import { count } from 'console';
import db from './db.js';

export async function db_registerUser(userData) {
    await db.execute({
        sql: `
        INSERT INTO users (email, name, lastname, oauth_provider, oauth_user_id, email_verified, profile_picture, created_date, last_login, hashed_password, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            userData.email,                  // email
            userData.name,                 // name
            userData.lastname,               // lastname
            userData.oauth_provider || '',   // oauth_provider
            userData.oauth_user_id || '',    // oauth_user_id
            false,                           // email_verified
            userData.profile_picture || "",  // profile_picture
            new Date().toISOString().split('.')[0] + 'Z',                      // created_date
            new Date().toISOString().split('.')[0] + 'Z',                      // last_login
            userData.hashed_password || "",   // hashed_password
            userData.country                   // country
        ]
    });

    let uuid = await db.execute({
        sql: `
          SELECT uuid from users WHERE email = ?
        `,
        args: [
            userData.email,
        ]
    });

    let countryData = await db.execute({
        sql: `
          SELECT * FROM countries WHERE id = ?
        `,
        args: [
            userData.country,
        ]
    });

    return {
      uuid: uuid.rows.length > 0 ? uuid.rows[0].uuid : null,
      country: countryData.rows.length > 0 ? countryData.rows[0] : null
    };
}

export async function db_authenticateUser(email){
    // Consultar el usuario por email
    const users = await db.execute("SELECT email, hashed_password FROM users WHERE email = ?", [email]);
    console.log("users:", users.rows);

    return users.rows.length > 0 ? users.rows[0] : null;
}

export async function db_getUserData(email){
    // Consultar el usuario por email
    const users = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (users.rows.length !== 0) {
        await db.execute("UPDATE users SET last_login = ? WHERE email = ?", [new Date().toISOString().split('.')[0] + 'Z', email]);
    }
    console.log("users:", users.rows);

    return users.rows.length > 0 ? users.rows[0] : null;
}

export async function db_getUserDataByUUID(uuid){
    // Consultar el usuario por UUID
    const users = await db.execute("SELECT * FROM users WHERE uuid = ?", [uuid]);
    if (users.rows.length !== 0) {
        await db.execute("UPDATE users SET last_login = ? WHERE uuid = ?", [new Date().toISOString().split('.')[0] + 'Z', uuid]);
    }
    console.log("users:", users.rows);
    if (users.rows.length === 0) {
        return null;
    }
    // Format the user data to include country details
    const formatted = users.rows.map(row => ({
      uuid: row.uuid,
      name: row.name,
      lastname: row.lastname,
      profile_picture: row.profile_picture,
      email_verified: row.email_verified === 1, // Convert to boolean
      email: row.email,
      country: {
        id: row.country,
        currency: row.currency,
        country_iso_code: row.country_iso_code,
        currency_symbol: row.currency_symbol,
        currency_format: row.currency_format,
        flag_icon: row.flag_icon,
        language_code: row.language_code
      }
    }));

    return formatted;
}

export async function db_changeUserPassword(email, newPassword){
    const user = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (user.rows.length === 0) {
        throw new Error("Usuario no encontrado");
    }

    const result = await db.execute("UPDATE users SET hashed_password = ? WHERE email = ? AND id = ?", [newPassword, email, user.rows[0].id]);

    return result.rowsAffected > 0; // Devuelve true si se actualizó
}

async function db_getUserUUID(email) {
    let userUUID = await db.execute({
        sql: `
        SELECT uuid FROM users WHERE email = ?
        `,
        args: [
            email                  // country
        ]
    });

    return {
      userUUID: userUUID.rows.length > 0 ? userUUID.rows[0].uuid : null,
    };
}

export async function db_getUserId(uuid) {
    let userId = await db.execute({
        sql: `
        SELECT id FROM users WHERE uuid = ?
        `,
        args: [
            uuid
        ]
    });

    return {
      userId: userId.rows.length > 0 ? userId.rows[0].id : null,
    };
}

export async function db_verifyUserEmail(uuid) {
    const userExists = await db_checkUserExists(uuid);
    if (!userExists || !userExists.userId) {
        throw new Error("Usuario no encontrado");
    }
    const result = await db.execute("UPDATE users SET email_verified = 1 WHERE uuid = ?", [uuid]);

    return result.rowsAffected > 0; // Devuelve true si se actualizó
}

async function db_checkUserExists(uuid) {
    let userId = await db.execute({
        sql: `
        SELECT id FROM users WHERE uuid = ?
        `,
        args: [
            uuid
        ]
    });

    return {
      userId: userId.rows.length > 0 ? userId.rows[0].id : null,
    };
}

export async function db_updateUserProfilePicture(uuid, fileData){
    const userExists = await db_checkUserExists(uuid);
    if (!userExists || !userExists.userId) {
        throw new Error("Usuario no encontrado");
    }

    const result = await db.execute("UPDATE users SET profile_picture = ? WHERE uuid = ?", [fileData, uuid]);

    return result.rowsAffected > 0; // Devuelve true si se actualizó
}

// 1. Generate and store OTP code
export async function db_generateOTP(email, code) {
    const user = await db_getUserUUID(email);
    if (!user || !user.userUUID) {
        return null;
    }

    const now = new Date();
    const expiration = new Date(now.getTime() + 30 * 60 * 1000); // 30 min

    await db.execute({
        sql: `
        INSERT INTO otp_codes (user_id, otp_code, creation_date, expiration_date, is_used)
        VALUES (?, ?, ?, ?, ?)
        `,
        args: [user.userUUID, code, now.toISOString(), expiration.toISOString(), 0]
    });

    return { otp: code, uuid: user.userUUID };
}

// 2. Validate OTP
export async function db_validateOTP(uuid, code) {
    const user = await db_getUserId(uuid);
    if (!user || !user.userId) {
        throw new Error("Usuario no encontrado");
    }

    const now = new Date().toISOString();

    const result = await db.execute({
        sql: `
        SELECT * FROM otp_codes
        WHERE user_id = ?
        AND otp_code = ?
        AND is_used = 0
        AND expiration_date > ?
        LIMIT 1
        `,
        args: [user.userId, code, now]
    });

    return result.rows.length > 0 ? { expiration: result.rows[0].expiration_date, otp: result.rows[0].otp_code, userId: user.userId } : null;
}

// 3. Mark OTP as used
export async function db_markOTPUsed(userId, code) {
  await db.execute({
      sql: `
      UPDATE otp_codes
      SET is_used = 1
      WHERE user_id = ?
      AND otp_code = ?
      `,
      args: [userId, code]
  });
}

export async function db_registerOAuthUser(oauth: {
  email: string;
  name: string;
  lastname?: string;
  provider: string;
  providerUserId: string;
  emailVerified: boolean;
  picture?: string;
  countryId?: number;
}) {
  try {
    // Buscar usuario por email
    const stmtFind = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [oauth.email],
    });

    const user = stmtFind.rows[0];

    if (user) {
      // Actualizar last_login
      await db.execute({
        sql: "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = ?",
        args: [oauth.email],
      });

      return { success: true, user, error: "" };
    } else {
      const provider = "https://accounts.google.com";

      await db.execute({
        sql: `
          INSERT INTO users (
            email, name, lastname, oauth_provider, oauth_user_id,
            email_verified, profile_picture, created_date, last_login, hashed_password, country
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        args: [
          oauth.email,
          oauth.name,
          oauth.lastname,
          provider,
          oauth.providerUserId,
          oauth.emailVerified ? 1 : 0,
          oauth.picture,
          Date.now(),                      // created_date
          Date.now(),
          "",
          oauth.countryId // Default country ID: Mexico
        ],
      });

      // Get the newly uuid created user
      const newUserRes = await db.execute({
        sql: "SELECT uuid FROM users WHERE email = ?",
        args: [oauth.email],
      });

      const newUser = newUserRes.rows[0].uuid;
      return { success: true, userUUID: newUser, error: "" };
    }
  } catch (error) {
    console.error("Error en authGoogle:", error);
    return { success: false, user: {}, error };
  }
}