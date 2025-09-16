import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
// Import interfaces
import { User, Register, JWTPayload, JWTPayloadVerify, Authenticate } from '@interfaces/user';
import { signupSchema, loginSchema, changePasswordSchema, updateProfileSchema, fileSchema } from '@validations/schemas';
import { SignupData, LoginData, ChangePasswordData, UpdateProfileData, FileData } from '@validations/types';

// ------ Import schemas and mapping functions ------
// Google
import { OAuth2Client } from "google-auth-library";
import { GoogleUserSchema, GoogleUser } from "@schemas/google";
import { mapGoogleToDB } from "@mappers/googleToDB";
// GitHub
import { getGithubToken, getGithubUser } from "@auth/providers/github";
import { GithubUserSchema, GithubUser } from "@schemas/github";
import { mapGithubToDB } from "@mappers/githubToDB";

// Import utils y services
import { email_OTP, email_verify } from "@utils/emails.ts";
import { consoleLog, generateRandomOTP } from "@utils/helpers.ts";
import { db_registerUser, db_authenticateUser, db_changeUserPassword, db_generateOTP, db_validateOTP, 
   db_markOTPUsed, db_registerOAuthUser, db_updateUserProfilePicture, 
   db_getUserData, db_verifyUserEmail,
   db_getUserDataByUUID} from "@services/user.js";

import { createAuthTokens, getAccessTokenFromHeader, revokedCSRFToken, verifyAccessToken } from '@auth/config/users.js';
import user from '@routes/user';
import { access } from 'fs';

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const VERIFY_EMAIL_SECRET = process.env.VERIFY_EMAIL_SECRET as string;

// Helper function para convertir datos de LibSQL
function parseAuthFromDb(dbUser: any): Authenticate {
   return {
      email: String(dbUser.email),
      hashedPassword: String(dbUser.hashed_password),
      uuid: String(dbUser.uuid)
   };
}

function parseUserFromDb(dbUser: any): User {
   return {
      uuid: String(dbUser.uuid),
      email: String(dbUser.email),
      name: String(dbUser.name),
      lastname: String(dbUser.lastname),
      hashedPassword: String(dbUser.hashedPassword),
      profile_picture: String(dbUser.profile_picture),
      country: Object(dbUser.country),
      email_verified: Boolean(dbUser.email_verified)
   };
}

function parseRegisterFromDb(dbUser: any): Register {
   return {
      uuid: String(dbUser.uuid),
      country: Object(dbUser.country)
   };
}

export async function login(req: Request, res: Response): Promise<Response> {
   try {
      consoleLog("-----Iniciando sesión-----");
      consoleLog("Datos de la solicitud:", req.body);
      // Validation with Zod
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
         const errors = validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
         }));

         return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
         });
      }

      const { email, password } : LoginData = validationResult.data;
      // Authenticate user
      const result = await db_authenticateUser(email);
      console.log("Authentication result:", result);
      if (!result) {
         return res.status(404).json({ 
            success: false, 
            message: "The user does not exist" 
         });
      }

      const userData = parseAuthFromDb(result);
      console.log("userData:", userData);
      if (!bcrypt.compareSync(password, userData.hashedPassword)) {
         console.log("Invalid password");
         return res.status(404).json({
            success: false,
            message: "The password is invalid"
         });
      }

      const fullUserDataResult = await db_getUserData(email);
      const userDataFull = parseUserFromDb(fullUserDataResult);
      console.log("userDataFull:", userDataFull);

      // Create payload for JWT
      const payload: JWTPayload = {
         user: {
            uuid: userDataFull.uuid,
            email: userDataFull.email,
            name: userDataFull.name,
            lastname: userDataFull.lastname,
            profile_picture: userDataFull.profile_picture,
            country: userDataFull.country,
            email_verified: userDataFull.email_verified
         },
         purpose: 'authentication',
         issuedAt: Date.now(),
      };

      // Generate token
      // const token: string = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '24h' });
      // const refreshToken: string = jwt.sign({ uuid: userDataFull.uuid, jti: uuidv4(), }, REFRESH_SECRET, { expiresIn: '1d' });
      const { accessToken: token, refreshToken, csrfToken } = await createAuthTokens(payload, userDataFull.uuid);

      return res
         .cookie('refreshToken', refreshToken, {
            httpOnly: true,       // 🔐 No accesible desde JavaScript
            secure: process.env.NODE_ENV === 'production',         // 🔒 Solo se envía por HTTPS
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',   // 🛡️ Protege contra CSRF
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 día
         })
         .status(200)
         .json({ 
            success: true, 
            token: token,
            csrfToken: csrfToken
         });
      
   } catch (error) {
      console.error('Ocurrió un error:', error);
      return res.status(401).json({ 
         success: false,
         message: 'Authentication failed'
      });
   }
}

export async function signup(req: Request, res: Response): Promise<Response> {
   try {
      // Validation with Zod
      const validationResult = signupSchema.safeParse(req.body);
      
      if (!validationResult.success) {
         const errors = validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
         }));
         
         return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
         });
      }

      const { email, password, name, lastname, countryId }: SignupData = validationResult.data;

      const hashedPassword = await bcrypt.hash(password, 10);

      let user = {
         email: email, name: name, lastname: lastname, 
         hashed_password: hashedPassword, country: countryId, 
         profile_picture: ""
      }
      console.log("User to register:", user);
      const response = await db_registerUser(user);

      if (!response || !response.uuid || !response.country) {
         return res.status(404).json({ 
            success: false, 
            message: "Error on creating user account. Please try again." 
         });
      }

      const userData = parseRegisterFromDb(response);

      // Create payload for JWT
      const payload: JWTPayload = {
         user: {
            uuid: userData.uuid,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            profile_picture: user.profile_picture,
            country: userData.country,
            email_verified: false
         },
         purpose: 'authentication',
         issuedAt: Date.now(),
      };

      const { accessToken, refreshToken, csrfToken } = await createAuthTokens(payload, userData.uuid);

      // ---------- Send verification email ----------
      // Create payload for JWT
      const verifyPayload: JWTPayloadVerify = {
         uuid: userData.uuid,
         purpose: 'email_verification',
         issuedAt: Date.now(),
      };
      const verifyToken: string = jwt.sign(verifyPayload, VERIFY_EMAIL_SECRET, { expiresIn: '1d' });
      await email_verify(user.email, user.name, verifyToken);
      // ---------------------------------------------

      return res
         .cookie('refreshToken', refreshToken, {
            httpOnly: true,       // 🔐 No accesible desde JavaScript
            secure: true,         // 🔒 Solo se envía por HTTPS
            sameSite: 'none',   // 🛡️ Protege contra CSRF
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 día
         })
         .status(200)
         .json({
            token: accessToken,
            csrfToken: csrfToken,
         });
   } catch (error) {
      console.error('An error occurred:',error);
      return res.status(400).json({ error: "Error on creating user account. Please try again." });
   }
}

export async function logout(req,res){
   const accessToken = getAccessTokenFromHeader(req);
   const decoded = verifyAccessToken(accessToken);
   const csrfToken = req.headers['x-csrf-token'];

   if (!decoded) {
      return res.status(401).json({ message: 'Token de acceso inválido' });
   }

   const decodedPayload = decoded as JWTPayload;

   await revokedCSRFToken(csrfToken, decodedPayload.user.uuid);
   // Destruir la sesión y redirigir a la página de inicio de sesión
   res
      .clearCookie('refreshToken', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'none',
      })
      .status(200)
      .json({ success: true, message: 'Sesión cerrada correctamente' });
}

export const refreshTokenHandler = async (req: Request, res: Response) => {
   const _refreshToken = req.cookies.refreshToken;

   if (!_refreshToken) {
      return res.status(401).json({ success: false, message: 'No se encontró el refresh token' });
   }

   try {
      // ✅ Validar el refresh token
      const payload = jwt.verify(_refreshToken, REFRESH_SECRET) as { uuid: string };

      // 🧠 Obtener el usuario
      const user = await db_getUserDataByUUID(payload.uuid);
      if (!user) {
         return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const userData = parseUserFromDb(user);

      // Create payload for JWT
      const newPayload: JWTPayload = {
         user: {
            uuid: userData.uuid,
            email: userData.email,
            name: userData.name,
            lastname: userData.lastname,
            profile_picture: userData.profile_picture,
            country: userData.country,
            email_verified: userData.email_verified
         },
         purpose: 'authentication',
         issuedAt: Date.now(),
      };

      // // Generate token
      // const newAccessToken: string = jwt.sign(newPayload, ACCESS_SECRET, { expiresIn: '1d' });

      // // Rotar refresh token
      // const newRefreshToken: string = jwt.sign({ uuid: userData.uuid, jti: uuidv4(), }, REFRESH_SECRET, { expiresIn: '1d' });

      const { accessToken, refreshToken, csrfToken } = await createAuthTokens(newPayload, newPayload.user.uuid);

      // 🍪 Actualizar la cookie y 📦 Enviar nuevo access token
      return res
         .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 día
         })
         .status(200)
         .json({ success: true, accessToken, csrfToken });
   } catch (err) {
      console.error('Error al refrescar token:', err);
      return res.status(401).json({ success: false, message: 'Refresh token inválido o expirado' });
   }
};


export async function changeUserPassword(req: Request, res: Response): Promise<Response> {
   try {
      consoleLog("-----Cambiando contraseña-----");
      // Validation with Zod
      const validationResult = changePasswordSchema.safeParse(req.body);

      if (!validationResult.success) {
         const errors = validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
         }));

         return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
         });
      }

      const { currentPassword, newPassword, confirmPassword, uuid } : ChangePasswordData = validationResult.data;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const response = await db_changeUserPassword(uuid, hashedPassword)

      if (!response) {
         return res.status(401).json({ success: false, message: "No se pudo actualizar la contraseña" })
      }
      return res.status(200).json({ success: true })
   } catch (error) {
      console.error(error);
      // Enviar respuesta JSON indicando fallo
      res.status(401).json({ success: false });
   }
}

export async function verifyEmail(req: Request, res: Response): Promise<Response> {
   try {
      const { token } = req.params;
      if (!token) return res.status(400).json({ success: false, message: "Token is required" });

      const payload = jwt.verify(token, VERIFY_EMAIL_SECRET) as JWTPayloadVerify;
      if (!payload || payload.purpose !== 'email_verification') return res.status(401).json({ success: false, message: "Invalid token" });

      if (payload.purpose !== 'email_verification') {
         return res.status(400).json({ success: false, message: "Invalid token purpose" });
      }

      const now = Math.floor(Date.now() / 1000);
      if(payload.exp && now > payload.exp) {
         return res.status(401).json({ success: false, message: "Token expired" });
      }

      const user = await db_getUserDataByUUID(payload.uuid);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const userDataFull = parseUserFromDb(user);
      const newPayload: JWTPayload = {
         user: {
            uuid: userDataFull.uuid,
            email: userDataFull.email,
            name: userDataFull.name,
            lastname: userDataFull.lastname,
            profile_picture: userDataFull.profile_picture,
            country: userDataFull.country,
            email_verified: userDataFull.email_verified
         },
         purpose: 'authentication',
         issuedAt: Date.now(),
      };
      const { accessToken, refreshToken, csrfToken } = await createAuthTokens(newPayload, userDataFull.uuid);

      if (userDataFull.email_verified) {
         return res
               .cookie('refreshToken', refreshToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
               })
               .status(200).json({ success: true, message: "Email is already verified", accessToken, csrfToken});
      }

      await db_verifyUserEmail(user.id);
      return res
            .cookie('refreshToken', refreshToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
               })
            .status(200).json({ success: true, message: "Email verified successfully", accessToken, csrfToken });
   } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
   }
}

export async function resendVerificationEmail(req: Request, res: Response): Promise<Response> {
   try {
      consoleLog("-----Reenviando email de verificación-----");
      const authToken = getAccessTokenFromHeader(req);

      if (!authToken) {
         return res.status(401).json({ success: false, message: "Token no proporcionado" });
      }

      const payload = verifyAccessToken(authToken) as JWTPayload;

      console.log("Payload from token:", payload);

      const { email } = payload.user;

      const fullUserDataResult = await db_getUserData(email);
      const userDataFull = parseUserFromDb(fullUserDataResult);
      console.log("userDataFull:", userDataFull);

      if(userDataFull.email_verified) {
         // Create payload for JWT
         const payload: JWTPayload = {
            user: {
               uuid: userDataFull.uuid,
               email: userDataFull.email,
               name: userDataFull.name,
               lastname: userDataFull.lastname,
               profile_picture: userDataFull.profile_picture,
               country: userDataFull.country,
               email_verified: userDataFull.email_verified
            },
            purpose: 'authentication',
            issuedAt: Date.now(),
         };
         // Generate token
         const { accessToken, refreshToken, csrfToken } = await createAuthTokens(payload, userDataFull.uuid);

         return res
            .cookie('refreshToken', refreshToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            })
            .status(200)
            .json({ success: true, message: "Email is already verified", accessToken, csrfToken});
      }
      // ---------- Send verification email ----------
      // Create payload for JWT
      const verifyPayload: JWTPayloadVerify = {
         uuid: userDataFull.uuid,
         purpose: 'email_verification',
         issuedAt: Date.now(),
      };
      const verifyToken: string = jwt.sign(verifyPayload, VERIFY_EMAIL_SECRET, { expiresIn: '1d' });
      await email_verify(userDataFull.email, userDataFull.name, verifyToken);
      // ---------------------------------------------
      return res.status(200).json({ success: true, message: "Verification email sent successfully" });
   } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
   }
}

// export async function updateProfile(req: Request, res: Response): Promise<Response> {
//    try {
//       consoleLog("-----Actualizando perfil-----");
//       // Validation with Zod
//       const validationResult = updateProfileSchema.safeParse(req.body);

//       if (!validationResult.success) {
//          const errors = validationResult.error.issues.map(err => ({
//             field: err.path.join('.'),
//             message: err.message
//          }));

//          return res.status(400).json({
//             success: false,
//             message: "Validation failed",
//             errors: errors
//          });
//       }

//       const { name, lastname, countryId } : UpdateProfileData = validationResult.data;
//       const response = await db_updateUserProfile(req.user.id, { name, lastname, countryId });

//       if (!response) {
//          return res.status(401).json({ success: false, message: "No se pudo actualizar la contraseña" })
//       }
//       return res.status(200).json({ success: true })
//    } catch (error) {
//       console.error(error);
//       // Enviar respuesta JSON indicando fallo
//       res.status(401).json({ success: false });
//    }
// }

export async function updateProfilePicture(req: Request, res: Response): Promise<Response> {
   try {
      consoleLog("-----Actualizando foto de perfil-----");
      // Validation with Zod
      const validationResult = fileSchema.safeParse(req.body.file);

      if (!validationResult.success) {
         const errors = validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
         }));

         return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
         });
      }

      const { originalname, mimetype, size, uuid } : FileData = validationResult.data;
      // Agregar multer middleware para manejar la subida de archivos


      const response = await db_updateUserProfilePicture(uuid, { originalname, mimetype, size, uuid });

      if (!response) {
         return res.status(401).json({ success: false, message: "No se pudo actualizar la foto de perfil" })
      }
      return res.status(200).json({ success: true })
   } catch (error) {
      console.error(error);
      // Enviar respuesta JSON indicando fallo
      res.status(401).json({ success: false });
   }
}

export async function generateOTP(req: Request, res: Response): Promise<Response> {
   try {
      const email = req.body.email;
      if (!email) return res.status(400).json({ success: false, message: "Email is required" });

      const otp = generateRandomOTP();
      const dbResponse = await db_generateOTP(email, otp)
      if (!dbResponse) return res.status(401).json({ success: false, messageCode: "No se pudo generar el código OTP. Inténtelo nuevamente" });

      const emailResponse = await email_OTP(email, dbResponse.otp)
      if (!emailResponse) return res.status(401).json({ success: false, message: "Error al generar código OTP. Inténtelo nuevamente" })

      const token = jwt.sign({ uuid: dbResponse.uuid, email: email }, process.env.KEY, { expiresIn: '30m' });

      return res.status(200).json({ success: true, token: token });
   } catch (error) {
      console.error(error);
      res.status(401).json({ success: false });
   }
}

export async function validateOTP(req: Request, res: Response): Promise<Response> {
   try {
      const { otp } = req.body;
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Extrae el token después de "Bearer"

      if (!token) {
      return res.status(401).json({ success: false, message: "Token no proporcionado" });
      }

      const payload = jwt.verify(token, process.env.KEY)  as JWTPayload;

      const dbResponse = await db_validateOTP(payload.user.email, otp)
      if (!dbResponse) return res.status(401).json({ success: false, message: "Error al crear su cuenta de usuario. Inténtelo nuevamente" })

      const now = new Date();
      if (Date.now() < Number(dbResponse.expiration)) return res.status(401).json({ success: false, message: "El código de seguridad ha expirado. Inténtelo nuevamente" })
      if (otp !== dbResponse.otp) return res.status(401).json({ success: false, message: "El código de seguridad ingresado es incorrecto" })

      await db_markOTPUsed(dbResponse.userId, otp);
      return res.status(200).json({ success: true });
   } catch (error) {
      console.error(error);
      // Enviar respuesta JSON indicando fallo
      res.status(401).json({ success: false });
   }
}

export async function googleAuth(req: Request, res: Response): Promise<Response> {
   try {
      consoleLog("🔐 Autenticando con Google...");

      const accessToken = req.body?.oauth;
      if (!accessToken || typeof accessToken !== "string") {
         return res.status(400).json({
         success: false,
         message: "Token OAuth inválido o ausente"
         });
      }

      const oAuth2Client = new OAuth2Client(
         process.env.GOOGLE_CLIENT_ID,
         process.env.GOOGLE_CLIENT_SECRET,
         "postmessage"
      );

      oAuth2Client.setCredentials({ access_token: accessToken });

      const { data } = await oAuth2Client.request({
         url: process.env.GOOGLE_OAUTH_URL as string
      });

      const validation = GoogleUserSchema.safeParse(data);
      if (!validation.success) {
         return res.status(400).json({
         success: false,
         message: "Datos de usuario inválidos desde Google"
         });
      }

      const googleUser: GoogleUser = validation.data;
      const userInput = mapGoogleToDB(googleUser);
      const response = await db_registerOAuthUser(userInput);

      if (!response.success || !response.user) {
         return res.status(500).json({
         success: false,
         message: "Error al registrar el usuario. Inténtelo nuevamente."
         });
      }

      const token = jwt.sign({
         user: {
            id: response.userUUID,
            email: userInput.email,
            lastname: userInput.lastname,
            name: userInput.name,
            profile_picture: userInput.picture,
            country: { id: userInput.countryId }
         }}, process.env.KEY as string, { expiresIn: "1h" }
      );

      return res.status(200).json({ success: true, token });
   } catch (error: any) {
      console.error("❌ Error en googleAuth:", error?.message || error);
      return res.status(500).json({
         success: false,
         message: "Error interno al autenticar con Google"
      });
   }
}

export async function githubAuth(req: Request, res: Response): Promise<Response> {
   try {
      consoleLog("🔐 Autenticando con GitHub...");

      const code = req.body?.code;
      if (!code || typeof code !== "string") {
         return res.status(400).json({ success: false, message: "Código OAuth inválido o ausente" });
      }

      const githubToken = await getGithubToken(code);
      if (!githubToken) {
         return res.status(401).json({ success: false, message: "No se pudo obtener el token de GitHub" });
      }

      const rawUser = await getGithubUser(githubToken);
      const validation = GithubUserSchema.safeParse(rawUser);

      if (!validation.success) {
         return res.status(400).json({ success: false, message: "Datos de usuario inválidos desde GitHub" });
      }

      const githubUser: GithubUser = validation.data;
      const userInput = mapGithubToDB(githubUser);
      const response = await db_registerOAuthUser(userInput);

      if (!response.success || !response.user) {
         return res.status(500).json({ success: false, message: "Error al registrar el usuario" });
      }

      const token = jwt.sign({
         user: {
            id: response.userUUID,
            email: userInput.email,
            lastname: userInput.lastname,
            name: userInput.name,
            profile_picture: userInput.picture,
            country: { id: userInput.countryId }
         }}, process.env.KEY as string, { expiresIn: "1h" }
      );

      return res.status(200).json({ success: true, token });
   } catch (error: any) {
      console.error("❌ Error en githubAuth:", error?.message || error);
      return res.status(500).json({ success: false, message: "Error interno al autenticar con GitHub" });
   }
}