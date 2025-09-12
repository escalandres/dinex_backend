import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
// Import interfaces
import { User, Register, JWTPayload } from '@interfaces/user';
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
import { email_OTP } from "@utils/emails.ts";
import { consoleLog, generateRandomOTP } from "@utils/helpers.ts";
import { db_registerUser, db_authenticateUser, db_changeUserPassword, db_generateOTP, db_validateOTP, 
   db_markOTPUsed, db_registerOAuthUser, db_updateUserProfilePicture } from "@services/user.js";

// Helper function para convertir datos de LibSQL
function parseUserFromDb(dbUser: any): User {
   return {
      uuid: String(dbUser.uuid),
      email: String(dbUser.email),
      name: String(dbUser.name),
      lastname: String(dbUser.lastname),
      hashedPassword: String(dbUser.hashedPassword),
      profile_picture: String(dbUser.profile_picture),
      country: Object(dbUser.country)
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
      
      if (!result || !result.success) {
         return res.status(404).json({ 
            success: false, 
            message: "The user does not exist" 
         });
      }
      
      if (!result.user) {
         return res.status(404).json({ 
         success: false, 
         message: "User data not found" 
         });
      }
      
      const userData = parseUserFromDb(result.user);
      if (!bcrypt.compareSync(password, userData.hashedPassword)) {
         return res.status(404).json({
            success: false,
            message: "The password is invalid"
         });
      }
      
      // Check if JWT secret key exists
      const jwtSecret = process.env.KEY;
      if (!jwtSecret) {
         throw new Error('JWT secret key not configured');
      }

      // Create payload for JWT
      const payload: JWTPayload = {
         user: {
            uuid: userData.uuid,
            email: userData.email,
            name: userData.name,
            lastname: userData.lastname,
            profile_picture: userData.profile_picture,
            country: userData.country
         }
      };

      // Generate token
      const token: string = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      return res.status(200).json({ 
         success: true, 
         token: token 
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

      const response = await db_registerUser(user);

      if (!response || !response.userId || !response.country) {
         return res.status(404).json({ 
            success: false, 
            message: "Error on creating user account. Please try again." 
         });
      }

      const userData = parseRegisterFromDb(response);

      // Check if JWT secret key exists
      const jwtSecret = process.env.KEY;
      if (!jwtSecret) {
         throw new Error('JWT secret key not configured');
      }

      // Create payload for JWT
      const payload: JWTPayload = {
         user: {
            uuid: userData.uuid,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            profile_picture: user.profile_picture,
            country: userData.country
         }
      };

      // Generate token
      const token: string = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      return res.status(200).json({
         token: token 
      });

   } catch (error) {
      console.error('An error occurred:',error);
      return res.status(400).json({ error: "Error on creating user account. Please try again." });
   }
}

export async function logout(req,res){
   // Destruir la sesión y redirigir a la página de inicio de sesión
   req.session.destroy((err) => {
      if (err) {
         console.error('Error al destruir la sesión:', err);
         return res.status(500).json({success: false, message: "Ha ocurrido un error con su petición. Inténtelo nuevamente"})
      }
      res.clearCookie('AuthToken');
      return res.status(200).json({success: true})
   });
}

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